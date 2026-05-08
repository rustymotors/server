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
                return;
            }
            log.error(`Socket error: ${error}`, {
                connectionId,
                port: socket.localPort,
                error,
            });
            Sentry.captureException(error);
        }),
    );
}

function findPackageSignatureIndices(data: Buffer): number[] {
    const packageSignature = Buffer.from('544f4d43', 'hex');
    const packageSignatureIndices: number[] = [];
    let index = 0;
    let currentIndex = 0;

    while (index !== -1) {
        index = data.indexOf(packageSignature, currentIndex);
        if (index !== -1) {
            packageSignatureIndices.push(index);
            currentIndex = index + 1;
        }
    }

    return packageSignatureIndices;
}

async function processIncomingPackets(
    data: Buffer<ArrayBufferLike>,
    log: ServerLogger,
    connectionId: string,
    port: number,
    socket: TaggedTcpSocket,
) {
    try {
        const inPackets: Buffer[] = [];

        log.debug(
            `Received data`, {
                namespace: "processIncommingPacket",
                connectionId,
                port: socket.localPort,
                data: data.toString("hex")
            },
        );

        /* Search for the package signature in the hex string
         * If found, split the data into packets
         * Each packet starts with the 2 bytes (16 bits) length of the packet
         * followed by the 4 bytes package signature
         */
        const indices = findPackageSignatureIndices(data);

        for (const indexOfPackageSignature of indices) {
            const length = data.readUInt16LE(indexOfPackageSignature - 2);
            const packet = data.subarray(
                indexOfPackageSignature - 2,
                indexOfPackageSignature + length,
            );
            inPackets.push(packet);
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
    let responses: MessageNode[] = [];

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
