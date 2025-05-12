import type { TaggedSocket } from './socketUtility.js';
import {
    GamePacket,
    type SerializableInterface,
} from 'rusty-motors-shared-packets';
import { receiveLobbyData } from 'rusty-motors-lobby';
import { receivePersonaData } from 'rusty-motors-personas';
import { receiveLoginData } from 'rusty-motors-login';
import {
    // getServerConfiguration,
    getServerLogger,
    ServerLogger,
} from 'rusty-motors-shared';
import { BytableMessage, createRawMessage } from '@rustymotors/binary';
// import { RoomServer } from '@rustymotors/roomserver';
// import { addRoomServer, getRoomServerByPort } from 'rusty-motors-database';
import { splitPackets } from './utility.js';
import * as Sentry from '@sentry/node';

// const server01 = new RoomServer({
//     id: 224,
//     name: 'MCC01',
//     ip: getServerConfiguration().host,
//     port: 9001,
// });
// addRoomServer(server01);

/**
 * Routes and processes incoming socket connections for the Network Play System (NPS), handling packet parsing, multi-packet detection, and response dispatch based on the local port.
 *
 * Listens for data events on the provided socket, splits and parses incoming packets, routes them according to the port, and sends appropriate responses. Handles errors and logs detailed debug information throughout the process.
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
    const { rawSocket: socket, connectionId: id } = taggedSocket;

    const port = socket.localPort || 0;

    if (port === 0) {
        log.error(`[${id}] Local port is undefined`);
        socket.end();
        return;
    }
    log.debug(`[${id}] NPS port router started for port ${port}`);

    // getMCOProtocolInstance().acceptIncomingSocket({
    // 	connectionId: id,
    // 	port,
    // 	socket,
    // });

    // return;

    if (port === 7003) {
        // Sent ok to login packet
        log.debug(`[${id}] Sending ok to login packet`);
        socket.write(Buffer.from([0x02, 0x30, 0x00, 0x04]));
    }

    // Handle the socket connection here
    socket.on('data', async (data) => {
        try {
            log.debug(`[${id}] Received data: ${data.toString('hex')}`);
            log.debug(`[${id}] Data length: ${data.length}`);

            let packets: Buffer[] = [];

            const separator = Buffer.from([0x11, 0x01]);
            // Count the number of packets
            const packetCount =
                data.toString('hex').split(separator.toString('hex')).length -
                1;
            log.debug(`[${id}] Number of packets: ${packetCount}`);
            if (packetCount > 1) {
                log.debug(`[${id}] More than one packet detected`);
                // Split the packets
                packets = splitPackets(data, separator);
                log.debug(
                    `[${id}] Split packets: ${packets.map((p) => p.toString('hex'))}`,
                );
            } else {
                log.debug(`[${id}] One packet detected`);
                // No need to split the packets
                packets = [data];
            }

            for (const packet of packets) {
                const initialPacket = parseInitialMessage(packet);
                log.debug(`[${id}] Initial packet(str): ${initialPacket}`);
                log.debug(
                    `[${id}] initial Packet(hex): ${initialPacket.toString()}`,
                );
                await routeInitialMessage(id, port, initialPacket)
                    .then((response) => {
                        // Send the response back to the client
                        log.debug(
                            `[${id}] Sending response to socket: ${response.toString('hex')}`,
                        );
                        socket.write(response);
                    })
                    .catch((error) => {
                        throw new Error(
                            `[${id}] Error routing initial nps message: ${error}`,
                            {
                                cause: error,
                            },
                        );
                    });
            }
        } catch (error) {
            if (error instanceof RangeError) {
                log.warn(`[${id}] Error parsing initial nps message: ${error}`);
            } else {
                Sentry.captureException(error);
                log.error(`[${id}] Error handling data: ${error}`);
            }
        }
    });

    socket.on('end', () => {
        // log.debug(`[${id}] Socket closed by client for port ${port}`);
    });

    socket.on('error', (error) => {
        if (error.message.includes('ECONNRESET')) {
            log.debug(`[${id}] Connection reset by client`);
            return;
        }
        log.error(`[${id}] Socket error: ${error}`);
    });
}

/**
 * Parses a raw buffer into a `BytableMessage` representing the initial game packet.
 *
 * Sets the message version based on the packet ID, then deserializes the buffer into a message object.
 *
 * @param data - The buffer containing the raw initial message.
 * @returns The parsed `BytableMessage` object.
 *
 * @throws {Error} If the buffer cannot be parsed into a valid message.
 */
function parseInitialMessage(data: Buffer): BytableMessage {
    try {
        const message = createRawMessage();
        message.setVersion(1);

        // There are a few messages here that need special handling due to length
        const id = data.readUInt16BE(0);
        if ([0x217, 0x532].includes(id)) {
            message.setVersion(0);
        }
        getServerLogger('gateway.npsPortRouter/parseInitialMessage').debug(
            `Parsing initial message: ${data.toString('hex')}`,
        );

        message.deserialize(data);

        getServerLogger('gateway.npsPortRouter/parseInitialMessage').debug(
            `Parsed initial message: ${message.serialize().toString('hex')}`,
        );
        return message;
    } catch (error) {
        const err = new Error(`Error parsing initial message: ${error}`, {
            cause: error,
        });
        getServerLogger('gateway.npsPortRouter/parseInitialMessage').error(
            (err as Error).message,
        );
        throw err;
    }
}

/**
 * Routes an initial game packet to the appropriate handler based on the connection port and returns the serialized response(s).
 *
 * Depending on the port, this function delegates processing to the lobby, login, or persona data handlers, and aggregates their responses for the client.
 *
 * @param connectionId - Unique identifier for the client connection.
 * @param connectionPort - Local port number used to select the appropriate handler.
 * @param initialPacket - The parsed initial packet received from the client.
 * @param log - Optional logger for debug and warning messages.
 * @returns A buffer containing the concatenated serialized responses from the selected handler.
 *
 * @remark If no handler exists for the specified {@link connectionPort}, an empty buffer is returned.
 */
async function routeInitialMessage(
    connectionId: string,
    connectionPort: number,
    initialPacket: BytableMessage,
    log = getServerLogger('gateway.npsPortRouter/routeInitialMessage'),
): Promise<Buffer> {
    // Route the initial message to the appropriate handler
    // Messages may be encrypted, this will be handled by the handler

    log.debug(
        `Routing message for port ${connectionPort}: ${initialPacket.toString()}`,
    );

    const gameRequestPacket = new GamePacket();
    gameRequestPacket.deserialize(initialPacket.serialize());

    let packetResponses: SerializableInterface[] = [];

    switch (connectionPort) {
        case 7003:
            // Handle lobby packet
            log.debug(
                `[${connectionId}] Passing packet to lobby handler: ${gameRequestPacket.serialize().toString('hex')}`,
            );
            packetResponses = (
                await receiveLobbyData({
                    connectionId: connectionId,
                    message: initialPacket,
                })
            ).messages;
            log.debug(
                `[${connectionId}] Lobby Responses: ${packetResponses.map((r) => r.serialize().toString('hex'))}`,
            );
            break;
        case 8226:
            // Handle login packet
            log.debug(
                `[${connectionId}] Passing packet to login handler: ${gameRequestPacket.serialize().toString('hex')}`,
            );
            packetResponses = (
                await receiveLoginData({
                    connectionId: connectionId,
                    message: initialPacket,
                })
            ).messages;
            log.debug(
                `[${connectionId}] Login Responses: ${packetResponses.map((r) => r.serialize().toString('hex'))}`,
            );
            break;
        // case 8227:
        // 	// Handle chat packet
        // 	log.debug(
        // 		`[${id}] Passing packet to chat handler: ${packet.serialize().toString("hex")}`,
        // 	);
        // 	responses = (await receiveChatData({ connectionId: id, message: packet }))
        // 		.messages;
        // 	log.debug(`[${id}] Chat Responses: ${responses.map((r) => r.serialize().toString("hex"))}`);
        // 	break;
        case 8228:
            log.debug(
                `[${connectionId}] Passing packet to persona handler: ${gameRequestPacket.serialize().toString('hex')}`,
            );
            // responses =Handle persona packet
            packetResponses = (
                await receivePersonaData({
                    connectionId: connectionId,
                    message: gameRequestPacket,
                })
            ).messages;
            log.debug(
                `[${connectionId}] Persona Responses: ${packetResponses.map((r) => r.serialize().toString('hex'))}`,
            );
            break;
        // case 9001: {
        //     const roomServer = getRoomServerByPort(connectionPort);
        //     if (roomServer === undefined) {
        //         log.warn(
        //             `No room server found for port ${connectionPort}`,
        //         );
        //         break;
        //     }
        //     log.debug(
        //         `Passing packet to room server: ${roomServer.name}`,
        //     );
        //     packetResponses = (
        //         await roomServer.receivePacket({
        //             connectionId: connectionId,
        //             packet: initialPacket,
        //         })
        //     ).messages;
        //     const serializedResponseData = Buffer.concat(
        //         packetResponses.map((r) => r.serialize()),
        //     );
        //     log.debug(
        //         {
        //             id: connectionId,
        //             port: connectionPort,
        //             roomServer: roomServer.name,
        //             responseBuffer: serializedResponseData.toString('hex'),
        //         },
        //         `Room Server Responses`,
        //     );
        //     break;
        // }
        default:
            // No handler
            log.warn(`No handler found for port ${connectionPort}`);
            break;
    }

    // Send responses back to the client
    log.debug(`[${connectionId}] Sending ${packetResponses.length} responses`);

    // Serialize the responses
    const serializedResponses = packetResponses.map((response) =>
        response.serialize(),
    );

    return Buffer.concat(serializedResponses);
}
