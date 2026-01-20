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
} from 'rusty-motors-shared';
import { messageStats } from './GatewayServer.js';
import { getSessionRecorder } from './session/SessionRecorderIntegration.js';
import { getServiceRegistry, type Serializable } from './routing/ServiceRegistry.js';

/**
 * Handles routing for the NPS (Network Play System) ports.
 *
 * @param taggedSocket - The socket connection with associated metadata to be routed.
 *
 * @remark If the socket's local port is undefined, the connection is closed immediately. On port 7003, an "ok to login" packet is sent upon connection.
 */
export async function npsPortRouter({
    taggedSocket,
    log = getServerLogger('gateway.npsPortRouter'),
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

                log.debug(`Receiving packet in queue`);

                await processSocketData(
                    item.data,
                    log,
                    taggedSocket.connectionId,
                    taggedSocket.localPort,
                    taggedSocket,
                );
            } catch (err) {
                log.error(`Error receiving item: ${err}`);
                throw err;
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
                throw err;
            }
        },
    );

    addSocketPair(connectionId, {
        send: sendQueue,
        receive: receiveQueue,
    });

    // Lobby handshake - client blocks until these are received
    if (port === 7003) {
        // Send NPS_OK_TO_LOGIN (0x0230)
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
            return;
        }
        log.error(`[${connectionId}] Socket error: ${error}`);
        receiveQueue.exit();
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
 *
 * @param log - The logger instance used for logging debug, warning, and error messages.
 * @param id - A unique identifier for the current connection or session.
 * @param port - The port number associated with the socket connection.
 * @param socket - The socket instance used for communication with the client.
 * @returns A function that processes incoming data buffers from the socket.
 *
 * The returned function:
 * - Logs the received data and its length.
 * - Splits the data into packets based on a predefined separator if multiple packets are detected.
 * - Parses the initial message from each packet.
 * - Routes the initial message and sends the response back to the client.
 * - Handles errors during parsing, routing, or response sending, logging them appropriately.
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
        log.debug(`[${id}] Received data: ${data.toString('hex')}`);
        log.debug(`[${id}] Data length: ${data.length}`);

        const separator = Buffer.from([0x11, 0x01]);
        const packets = splitDataIntoPackets(data, separator, log, id);

        for (const packet of packets) {
            log.debug(`raw packet: ${packet.toString('hex')}`);
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
 * The function `splitDataIntoPackets` takes a data buffer, separator buffer, server logger, and ID
 * string, splits the data into packets based on the separator, and returns an array of buffers
 * representing the packets.
 * @param {Buffer} data - The `data` parameter is a Buffer containing the data that needs to be split
 * into packets.
 * @param {Buffer} separator - The `separator` parameter is a Buffer that is used to split the `data`
 * Buffer into separate packets. It is used to identify the boundaries between packets in the data.
 * @param {ServerLogger} log - The `log` parameter in the `splitDataIntoPackets` function is a
 * `ServerLogger` object that is used for logging debug messages. It is used to log information about
 * the packets being processed and split during the execution of the function.
 * @param {string} id - The `id` parameter in the `splitDataIntoPackets` function is a string that
 * represents an identifier for the data packets being processed. It is used for logging purposes to
 * track and identify the packets as they are split and processed.
 * @returns The function `splitDataIntoPackets` returns an array of Buffers containing the split data
 * packets.
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
    log.debug(`[${id}] ${packetCount} packets detected`);

    if (packetCount > 1) {
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
        log.debug(
            `[${id}] Split packets: ${packets.map((p) => p.toString('hex'))}`,
        );
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
 * This TypeScript function handles packet routing by routing an initial message and sending a response
 * through a socket while logging any errors.
 * @param {string} id - The `id` parameter is a string representing the unique identifier of the packet
 * being handled.
 * @param {number} port - The `port` parameter in the `handlePacketRouting` function is the port number
 * on which the initial packet is received. It is used to help route the initial message to the correct
 * destination based on the port number.
 * @param {BytableMessage} initialPacket - The `initialPacket` parameter in the `handlePacketRouting`
 * function is of type `BytableMessage`. It likely represents the initial packet of data that needs to
 * be routed based on the provided `id` and `port`.
 * @param {ServerLogger} log - Optional logger instance. Defaults to getServerLogger if not provided.
 */
function handlePacketRouting(
    id: string,
    port: number,
    initialPacket: BytableMessage,
    log: ServerLogger = getServerLogger('gateway.npsPortRouter/handlePacketRouting'),
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
 *
 * Sets the message version based on the packet ID, then deserializes the buffer into a message object.
 *
 * @param data - The buffer containing the raw initial message.
 * @param log - Optional logger instance. Defaults to getServerLogger if not provided.
 * @returns The parsed `BytableMessage` object.
 *
 * @throws {Error} If the buffer cannot be parsed into a valid message.
 */
function parseInitialMessage(
    data: Buffer,
    log: ServerLogger = getServerLogger('gateway.npsPortRouter/parseInitialMessage'),
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
 *
 * @param id - The connection ID of the client.
 * @param port - The port number to determine the type of packet.
 * @param initialPacket - The initial packet received from the client.
 * @param log - The logger to use for logging messages.
 */
async function routeInitialMessage(
    id: string,
    port: number,
    initialPacket: BytableMessage,
    log = getServerLogger('gateway.npsPortRouter/routeInitialMessage'),
): Promise<void> {
    try {
        log.debug(
            `Routing message for port ${port}: ${initialPacket.header.id}`,
        );

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
            log.debug(
                `[${id}] Passing packet to ${serviceName} handler: ${initialPacket.header.id}`,
            );

            const result = await handler({
                connectionId: id,
                message: initialPacket,
                log,
            });

            responses = result.messages as Serializable[];
            log.debug(
                `[${id}] Received ${responses.length} ${serviceName} response packets`,
            );
        } catch (error) {
            Sentry.captureException(error);
            log.error(`Error handling ${serviceName} packet`, {
                connectionId: id,
                port,
                error: error instanceof Error ? error.message : String(error),
            });
            return;
        }

        // Send responses back to the client
        if (responses.length > 0) {
            log.debug(`[${id}] Sending ${responses.length} responses`);
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
