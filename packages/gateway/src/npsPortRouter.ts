import { GamePacket } from 'rusty-motors-protocol';
import { type BytableMessage, createRawMessage } from '@rustymotors/binary';
import * as Sentry from '@sentry/node';
import {
    getServerLogger,
    type messageQueueItem,
    type ServerLogger,
    type TaggedSocket,
    MessageQueue,
    getSocketQueue,
    addSocketPair,
    resolveMessageId,
} from 'rusty-motors-shared';
import { messageStats } from './GatewayServer.js';
import { getSessionRecorder } from './session/SessionRecorderIntegration.js';
import { getServiceRegistry, type Serializable } from './routing/ServiceRegistry.js';

const suppressPing = process.env['MCO_LOG_SUPPRESS_PING'] === 'true';

/**
 * Handles routing for the NPS (Network Play System) ports.
 *
 * @param taggedSocket - The socket connection with associated metadata to be routed.
 *
 * @remark If the socket's local port is undefined, the connection is closed immediately. On port 7003, an "ok to login" packet is sent upon connection.
 */
export async function npsPortRouter({
    taggedSocket,
    log = getServerLogger('gateway'),
}: {
    taggedSocket: TaggedSocket;
    log?: ServerLogger;
}): Promise<void> {
    const { socket, connectionId, localPort } = taggedSocket;

    const port = localPort;

    const receiveQueue = new MessageQueue(
        'npsIn',
        10,
        async (item: messageQueueItem) => {
            try {
                // Record incoming data if recording is enabled
                const recorder = getSessionRecorder();
                if (recorder?.isRecordingEnabled()) {
                    recorder.recordDataIn(
                        taggedSocket.connectionId,
                        taggedSocket.localPort,
                        item.data,
                    );
                }

                if (!isPacketValid(item.data) && 'end' in taggedSocket.socket) {
                    taggedSocket.socket.end();
                    return;
                }

                await processSocketData(
                    item.data,
                    log,
                    taggedSocket.connectionId,
                    taggedSocket.localPort,
                    taggedSocket,
                );
            } catch (err) {
                log.error(`Error receiving item: ${err}`);
                // Do not re-throw - log and exit queue to prevent unhandled rejection crashes
                receiveQueue.exit();
            }
        },
    );

    const sendQueue = new MessageQueue(
        'npsOut',
        10,
        async (item: messageQueueItem) => {
            try {
                // Record outgoing data if recording is enabled
                const recorder = getSessionRecorder();
                if (recorder?.isRecordingEnabled()) {
                    recorder.recordDataOut(
                        taggedSocket.connectionId,
                        taggedSocket.localPort,
                        item.data,
                    );
                }

                log.debug(`Sending packet in queue`, {
                    data: item.data.toString("hex"),
                });
                if ('write' in socket) {
                    socket.write(item.data);
                } else {
                    socket.send(item.data);
                }
            } catch (err) {
                log.error(`Error sending item: ${err}`);
                // Do not re-throw - log and exit queue to prevent unhandled rejection crashes
                sendQueue.exit();
            }
        },
    );

    addSocketPair(connectionId, {
        send: sendQueue,
        receive: receiveQueue,
    });

    // Lobby handshake - client blocks until these are received
    if (port === 7003) {
        log.debug(`Sending NPS_OK_TO_LOGIN packet`);
        sendQueue.put({
            sequenceNo: -1,
            data: Buffer.from([0x02, 0x30, 0x00, 0x04]),
        });
    }

    // Handle the socket connection here
    socket.on('data', async (data) => {
        receiveQueue.put({
            sequenceNo: -1,
            data,
        });
    });

    socket.on('end', () => {
        // Record disconnect if recording is enabled
        const recorder = getSessionRecorder();
        if (recorder?.isRecordingEnabled()) {
            recorder.recordDisconnect(taggedSocket.connectionId, taggedSocket.localPort);
            // Auto-save session on disconnect
            recorder.saveSession(taggedSocket.connectionId, `Auto-saved on disconnect`);
        }
        const baseId = taggedSocket.connectionId.split(':')[0];
        log.info(`[${baseId}] Disconnected on port ${taggedSocket.localPort}`);
        receiveQueue.exit();
    });

    socket.on('error', (error) => {
        if (error.message.includes('ECONNRESET')) {
            log.debug(`[${connectionId}] Connection reset by client`);
            // Still save the session on reset - client likes to RST instead of FIN
            const recorder = getSessionRecorder();
            if (recorder?.isRecordingEnabled()) {
                recorder.recordDisconnect(taggedSocket.connectionId, taggedSocket.localPort);
                recorder.saveSession(taggedSocket.connectionId, `Auto-saved on ECONNRESET`);
            }
            receiveQueue.exit();
            sendQueue.exit();
            return;
        }
        log.error(`[${connectionId}] Socket error: ${error}`);
        receiveQueue.exit();
        sendQueue.exit();
    });
}

/**
 * The function `isPacketValid` checks if a packet of data is valid based on specific conditions
 * related to the message code within the data buffer.
 * @param {Buffer} data - A Buffer containing data to be checked for validity.
 * @returns The function `isPacketValid` returns a boolean value. If the conditions for the packet data
 * being valid are met, it returns `true`. Otherwise, if the data length is less than 4 or the message
 * code falls within certain ranges that indicate it is invalid, it returns `false`.
 */
function isPacketValid(data: Buffer): boolean {
    if (data.length < 4) {
        return false;
    }

    // Read the message code from the start of the buffer
    const msgCode = data.readUInt16BE();

    if (
        msgCode > 0x1301 ||
        msgCode < 0x100 ||
        (msgCode >= 0x902 && msgCode <= 0x1000)
    ) {
        // we know this is junk, toss it
        return false;
    }

    let counter = messageStats.get(msgCode) ?? 1;
    messageStats.set(msgCode, counter++);

    return true;
}

/**
 * Processes incoming socket data, splits it into packets if necessary, and routes
 * the initial message for further handling. Sends the response back to the client
 * through the socket.
 */
export async function processSocketData(
    data: Buffer<ArrayBufferLike>,
    log: ServerLogger,
    id: string,
    port: number,
    socket: TaggedSocket,
): Promise<void> {
    // Early tossing of known bad packets
    if (!isPacketValid(data) && 'end' in socket.socket) {
        socket.socket.end();
        return;
    }

    try {
        log.debug(`[${id}] Received data (${data.length}B): ${data.toString('hex')}`);

        const separator = Buffer.from([0x11, 0x01]);
        const packets = splitDataIntoPackets(data, separator, log, id);

        for (const packet of packets) {
            if (packet.byteLength === 0) {
                log.warn(`BUG: We recieved an empty packet from the splitter`);
                continue;
            }
            const initialPacket = parseInitialMessage(packet, log);
            handlePacketRouting(id, port, initialPacket, log);
        }
    } catch (error) {
        handleSocketError(error, log, id);
    }
}

/**
 * Splits data into packets based on a separator.
 */
function splitDataIntoPackets(
    data: Buffer,
    separator: Buffer,
    log: ServerLogger,
    id: string,
): Buffer[] {
    const packetsArray = data.toString('hex').split(separator.toString('hex'));
    const packetCount = packetsArray.length;
    let packets: Buffer[];

    if (packetCount > 1) {
        log.debug(`[${id}] ${packetCount} packets detected, splitting`);
        packets = packetsArray.map((packet: string) => {
            if (packet.length > 0) {
                return Buffer.concat([
                    Buffer.from([0x11, 0x01]),
                    Buffer.from(packet, 'hex'),
                ]);
            }
            return Buffer.alloc(0);
        });
        packets = removeEmptyEntries(packets);
    } else {
        packets = packetsArray.map((packet: string) => {
            return Buffer.from(packet, 'hex');
        });
    }
    return packets;

    function removeEmptyEntries(packets: Buffer<ArrayBufferLike>[]) {
        packets = packets.filter((packet: Buffer | undefined) => {
            return packet && packet.byteLength > 2;
        });
        return packets;
    }
}

/**
 * Handles packet routing by routing an initial message and sending a response
 * through a socket while logging any errors.
 */
function handlePacketRouting(
    id: string,
    port: number,
    initialPacket: BytableMessage,
    log: ServerLogger = getServerLogger('gateway'),
): void {
    // routeInitialMessage is async but we don't await it (fire-and-forget)
    // Add catch handler to prevent unhandled promise rejections
    // Errors are already caught and logged inside routeInitialMessage
    routeInitialMessage(id, port, initialPacket, log).catch((error) => {
        log.error(`[${id}] Unhandled error in routeInitialMessage promise: ${String(error)}`);
    });
}

function handleSocketError(
    error: unknown,
    log: ServerLogger,
    id: string,
): void {
    if (error instanceof RangeError) {
        log.warn(`[${id}] Error parsing initial nps message: ${error}`);
    } else {
        Sentry.captureException(error);
        log.error(`[${id}] Error handling data: ${error}`);
    }
}

/**
 * Parses a raw buffer into a `BytableMessage` representing the initial game packet.
 */
function parseInitialMessage(
    data: Buffer,
    log: ServerLogger = getServerLogger('gateway'),
): BytableMessage {
    try {
        const message = createRawMessage();
        message.setVersion(1);

        // There are a few messages here that need special handling due to length
        const id = data.readUInt16BE(0);
        if ([0x217, 0x532].includes(id)) {
            message.setVersion(0);
        }

        message.deserialize(data);

        return message;
    } catch (error) {
        const err = new Error(`Error parsing initial message: ${error}`, {
            cause: error,
        });
        log.error((err as Error).message);
        throw err;
    }
}

/**
 * Routes the initial message to the appropriate handler based on the port number.
 *
 * Uses the ServiceRegistry to look up handlers, following the Open/Closed Principle.
 * New services can be added by registering them in the registry without modifying this code.
 */
async function routeInitialMessage(
    id: string,
    port: number,
    initialPacket: BytableMessage,
    log = getServerLogger('gateway'),
): Promise<void> {
    const msgId = initialPacket.header.id;
    const msgName = resolveMessageId(msgId);

    // Suppress tracking ping logging if configured
    if (suppressPing && msgId === 0x0217) {
        // Still route the message, just don't log it
        const registry = getServiceRegistry();
        const handler = registry.getHandler(port);
        if (handler) {
            await handler({ connectionId: id, message: initialPacket, log });
        }
        return;
    }

    try {
        // Look up handler from the service registry
        const registry = getServiceRegistry();
        const handler = registry.getHandler(port);
        const serviceName = registry.getServiceName(port) ?? 'unknown';

        if (!handler) {
            const packet = new GamePacket();
            packet.deserialize(initialPacket.serialize());
            log.warn(
                `[${id}] No handler found for port ${port}: ${packet.serialize().toString('hex')}`,
            );
            return;
        }

        // Call the registered handler
        let responses: Serializable[] = [];

        try {
            const result = await handler({
                connectionId: id,
                message: initialPacket,
                log,
            });

            responses = result.messages as Serializable[];
        } catch (error) {
            Sentry.captureException(error);
            log.error(`Error handling ${serviceName} packet`, {
                connectionId: id,
                port,
                error: error instanceof Error ? error.message : String(error),
            });
            return;
        }

        // Single summary line per packet at verbose level
        log.verbose(`[${id}] ${msgName} --> ${serviceName} --> ${responses.length} response(s)`);

        // Send responses back to the client
        if (responses.length > 0) {
            const sendQueue = getSocketQueue(id, 'send');

            responses.forEach((response) =>
                sendQueue.put({
                    sequenceNo: -1,
                    data: response.serialize(),
                }),
            );
        }
    } catch (error) {
        // Catch any errors from packet deserialization or other operations
        log.error(`Error in routeInitialMessage: ${String(error)}`, {
            connectionId: id,
            port,
            error: error instanceof Error ? error.message : String(error),
        });
        Sentry.captureException(error);
    }
}
