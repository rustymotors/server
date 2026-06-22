import {
    receiveTransactionsData,
    UnsupportedMessageCodeError,
} from "rusty-motors-transactions";
import * as Sentry from "@sentry/node";
import { getServerLogger, MessageNode, type ServerLogger, type messageQueueItem, MessageQueue, type TaggedTcpSocket } from "rusty-motors-shared";
import { bindLogContext } from "@rustymotors/logging";
import { getSessionRecorder } from './session/SessionRecorderIntegration.js';

/**
 * Handles the routing of messages for the MCOTS (Motor City Online Transaction Server) ports.
 *
 * @param taggedSocket - The socket object that contains the tagged information for routing.
 */
export async function mcotsPortRouter({
    taggedSocket,
    log = getServerLogger('gateway.mcotsPortRouter'),
}: {
    taggedSocket: TaggedTcpSocket;
    log?: ServerLogger;
}): Promise<void> {
    const { socket, connectionId } = taggedSocket;

    if (!('localPort' in socket)) {        
        return
    }

    const { localPort} = socket

    const port = localPort || 0;

    if (port === 0) {
        log.error(`Local port is undefined`, {
            connectionId
        });
        socket.end();
        return;
    }

    log.debug(`MCOTS port router started`,{
        connectionId,
        port
    });
    const receiveQueue = new MessageQueue("mcoIn", 10, async (item: messageQueueItem) => {
        try {
            await processIncomingPackets(item.data, log, taggedSocket.connectionId, taggedSocket.localPort, taggedSocket)
        } catch (err) {
            log.error(`Error processing item: ${err}`,
                {
                    connectionId,
                    item: JSON.stringify(item),
                    error: err
                }
            )
            Sentry.captureException(err)
        }
    })


    // Handle the socket connection here. Each listener is wrapped with
    // bindLogContext so the connection's ALS frame is re-entered when the
    // event fires (libuv triggers emit() outside the registration frame).
    socket.on(
        'data',
        bindLogContext(async (data) => {
            // Record incoming data if recording is enabled
            const recorder = getSessionRecorder();
            if (recorder?.isRecordingEnabled()) {
                recorder.recordDataIn(connectionId, port, data);
            }

            receiveQueue.put({
                sequenceNo: -1,
                data,
            });
        }),
    );

    socket.on(
        'end',
        bindLogContext(() => {
            receiveQueue.exit();
            clearPartialBuffer(connectionId);

            // Record disconnect if recording is enabled
            const recorder = getSessionRecorder();
            if (recorder?.isRecordingEnabled()) {
                recorder.recordDisconnect(connectionId, port);
                recorder.saveSession(
                    connectionId,
                    `Auto-saved on disconnect (MCOTS port ${port})`,
                );
            }
        }),
    );

    socket.on(
        'error',
        bindLogContext((error) => {
            if (error.message.includes('ECONNRESET')) {
                log.debug(`Connection reset by client`, {
                    connectionId,
                    port: socket.localPort,
                });
                // Still save the session on reset - client likes to RST instead of FIN
                const recorder = getSessionRecorder();
                if (recorder?.isRecordingEnabled()) {
                    recorder.recordDisconnect(connectionId, port);
                    recorder.saveSession(
                        connectionId,
                        `Auto-saved on ECONNRESET (MCOTS port ${port})`,
                    );
                }
                receiveQueue.exit();
                clearPartialBuffer(connectionId);
                return;
            }
            log.error(`Socket error: ${error}`, {
                connectionId,
                port: socket.localPort,
                error,
            });
            Sentry.captureException(error);
            clearPartialBuffer(connectionId);
        }),
    );
}

/**
 * Per-connection accumulator for partial inbound MCOTS framing.
 *
 * TCP can split a single MCOTS-framed packet across multiple `data` events,
 * or coalesce multiple packets into one. The router has to buffer until at
 * least one complete framed packet is available, otherwise the decryptor
 * gets called on a truncated body and the cipher stream desynchronizes for
 * the rest of the connection (every subsequent decrypt produces garbage).
 *
 * Cleared by {@link clearPartialBuffer} on disconnect.
 *
 * @internal exported for tests only.
 */
export const _mcotsPartialBuffers = new Map<string, Buffer>();

const TOMC_BYTES = Buffer.from('544f4d43', 'hex');

/**
 * Minimum size of a framed MCOTS packet on the wire:
 *   2 bytes msgLength + 4 bytes "TOMC" + 4 bytes sequence + 1 byte flags +
 *   2 bytes msgNo (smallest valid body).
 */
const MIN_FRAMED_PACKET_SIZE = 13;

/**
 * Extract any complete MCOTS-framed packets from the head of the per-connection
 * accumulator. Incomplete trailing bytes are retained for the next call.
 *
 * Each emitted packet is a fresh slice of the accumulator and is safe to hand
 * to {@link parseInitialMessage} / decrypt as a whole — never a truncated body.
 *
 * @internal exported for tests only.
 */
export function _extractCompletePackets(
    connectionId: string,
    chunk: Buffer,
): { packets: Buffer[]; resyncedBytes: number } {
    const existing = _mcotsPartialBuffers.get(connectionId);
    let buf = existing ? Buffer.concat([existing, chunk]) : chunk;

    const packets: Buffer[] = [];
    let resyncedBytes = 0;

    for (;;) {
        if (buf.length < MIN_FRAMED_PACKET_SIZE) {
            break;
        }

        const tomcIdx = buf.indexOf(TOMC_BYTES);
        if (tomcIdx === -1) {
            // No anchor anywhere in the buffer. All bytes are unrecoverable
            // junk except for the last 3 (which could be the start of a
            // partial "TOMC" split across reads — keep them).
            const tail = Math.min(3, buf.length);
            resyncedBytes += buf.length - tail;
            buf = buf.subarray(buf.length - tail);
            break;
        }

        if (tomcIdx < 2) {
            // Found TOMC but with no room for the 2-byte length prefix in
            // front of it — these bytes can't be the start of a real packet.
            // Drop one byte and retry; the next iteration will look for the
            // following TOMC if any.
            resyncedBytes += 1;
            buf = buf.subarray(1);
            continue;
        }

        if (tomcIdx > 2) {
            // Bytes before the candidate packet's length prefix are junk.
            const drop = tomcIdx - 2;
            resyncedBytes += drop;
            buf = buf.subarray(drop);
            continue;
        }

        // tomcIdx === 2: the buffer is aligned at a candidate packet.
        const msgLength = buf.readUInt16LE(0);
        const totalSize = msgLength + 2;

        if (msgLength < 9) {
            // msgLength = 9 + body.sizeOf, so anything < 9 is malformed.
            // Drop the bogus length prefix + TOMC and resync to next TOMC.
            resyncedBytes += 1;
            buf = buf.subarray(1);
            continue;
        }

        if (buf.length < totalSize) {
            // Partial packet — wait for the rest.
            break;
        }

        packets.push(buf.subarray(0, totalSize));
        buf = buf.subarray(totalSize);
    }

    if (buf.length === 0) {
        _mcotsPartialBuffers.delete(connectionId);
    } else {
        _mcotsPartialBuffers.set(connectionId, buf);
    }

    return { packets, resyncedBytes };
}

/**
 * Drop any retained partial buffer for a connection. Call on disconnect.
 */
export function clearPartialBuffer(connectionId: string): void {
    _mcotsPartialBuffers.delete(connectionId);
}

async function processIncomingPackets(
    data: Buffer<ArrayBufferLike>,
    log: ServerLogger,
    connectionId: string,
    port: number,
    socket: TaggedTcpSocket,
) {
    try {
        log.debug(
            `Received data`, {
                namespace: "processIncommingPacket",
                connectionId,
                port: socket.localPort,
                data: data.toString("hex")
            },
        );

        // Append the chunk to this connection's accumulator and pull out any
        // complete MCOTS-framed packets. Trailing partial bytes stay in the
        // accumulator until the next data event. Without this, a packet that
        // arrives split across two TCP reads would be decrypted twice (once
        // truncated, then on the orphaned tail) and desynchronize the cipher
        // stream for every subsequent message on this connection.
        const { packets: inPackets, resyncedBytes } = _extractCompletePackets(
            connectionId,
            data,
        );

        if (resyncedBytes > 0) {
            log.warn(
                `Skipped ${resyncedBytes} byte(s) of unframed mcots data while resyncing`,
                { connectionId, port },
            );
        }

        log.debug(`Received ${inPackets.length} packets`, {
            connectionId
        });

        inPackets.forEach(async (packet, idx) => {

            log.debug(`Processing packet #${idx}`,{
                connectionId,
                data: packet.toString("hex")
            });
            const initialPacket: MessageNode = parseInitialMessage(packet);
            if (!initialPacket.isValidSignature()) {
                // Drop the packet entirely. Don't decrypt, don't dispatch,
                // don't capture to Sentry — invalid framing is not actionable
                // and would just spam noise. Header context is already in
                // the "Processing packet" debug log above.
                log.warn(
                    `Dropping mcots packet with invalid signature`,
                    {
                        connectionId,
                        port,
                        signature: initialPacket.signature,
                        msgLength: initialPacket.length,
                        flags: initialPacket.flags,
                    },
                );
                return;
            }
            await routeInitialMessage(connectionId, port, initialPacket)
            .then((response) => {
                // Record outgoing data if recording is enabled
                const recorder = getSessionRecorder();
                if (recorder?.isRecordingEnabled() && response.length > 0) {
                    recorder.recordDataOut(connectionId, port, response);
                }

                // Send the response back to the client
                socket.socket.write(response);
            })
            .catch(error => {
                log.error(
                    `Error routing initial mcots message: ${error}`,
                    {
                        connectionId,
                        port,
                        cause: error,
                    },

                )
                // UnsupportedMessageCodeError is reported (or filtered out
                // for non-positive codes) by processInput itself — don't
                // double-capture here.
                if (!(error instanceof UnsupportedMessageCodeError)) {
                    Sentry.captureException(error)
                }


            });
        })
    } catch (error) {
        log.error(`Error handling data: ${error}`, {
            connectionId,
            port,
            cause: error
        });
        Sentry.captureException(error);
        
    }
}
    


function parseInitialMessage(data: Buffer): MessageNode {
    const initialPacket: MessageNode = new MessageNode();
    initialPacket.deserialize(data);
    return initialPacket;
}

async function routeInitialMessage(
    id: string,
    port: number,
    initialPacket: MessageNode,
    log = getServerLogger("gateway.mcotsPortRouter/routeInitialMessage"),
): Promise<Buffer> {
    // Route the initial message to the appropriate handler
    // Messages may be encrypted, this will be handled by the handler

    log.debug(`Routing message for port ${port}: ${initialPacket.msgNo}`);
    let responses: { serialize(): Buffer }[] = [];

    switch (port) {
        case 43300:
            // Handle transactions packet
            responses = (
                await receiveTransactionsData({
                    connectionId: id,
                    message: initialPacket,
                })
            ).messages;
            break;
        default:
            log.warn(`No handler found for port ${port}`, { connectionId: id, port });
            break;
    }

    // Send responses back to the client
    log.debug(`[${id}] Sending ${responses.length} responses`);

    // Serialize the responses
    const serializedResponses = responses.map((response) => response.serialize());

    return Buffer.concat(serializedResponses);
}
