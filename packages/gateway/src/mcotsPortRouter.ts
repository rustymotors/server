import type { TaggedSocket } from './socketUtility.js';
import {
    ServerPacket,
    type SerializableInterface,
} from 'rusty-motors-shared-packets';
import { receiveTransactionsData } from 'rusty-motors-transactions';
import * as Sentry from '@sentry/node';
import { getServerLogger, ServerLogger } from 'rusty-motors-logger';

/**
 * Routes and processes incoming messages on MCOTS ports using a tagged socket connection.
 *
 * Listens for data events on the provided {@link TaggedSocket}, parses incoming packets, routes them based on the socket's local port, and sends responses back to the client. Handles errors by logging and reporting to Sentry.
 *
 * @param taggedSocket - The tagged socket containing the raw socket and connection ID for routing.
 *
 * @remark
 * If the socket's local port is undefined, the function logs an error and closes the connection without processing data.
 */

export async function mcotsPortRouter({
    taggedSocket,
    log = getServerLogger('gateway.mcotsPortRouter'),
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

    log.debug(`[${id}] MCOTS port router started for port ${port}`);

    // Handle the socket connection here
    socket.on('data', async (data) => {
        try {
            log.debug(`[${id}] Received data: ${data.toString('hex')}`);
            const initialPacket = parseInitialMessage(data);
            log.debug(`[${id}] Initial packet(str): ${initialPacket}`);
            log.debug(
                `[${id}] initial Packet(hex): ${initialPacket.toHexString()}`,
            );
            await routeInitialMessage(id, port, initialPacket)
                .then((response) => {
                    // Send the response back to the client
                    log.debug(
                        `[${id}] Sending response: ${response.toString('hex')}`,
                    );
                    socket.write(response);
                })
                .catch((error) => {
                    throw new Error(
                        `[${id}] Error routing initial mcots message: ${error}`,
                        {
                            cause: error,
                        },
                    );
                });
        } catch (error) {
            Sentry.captureException(error);
            log.error(`[${id}] Error handling data: ${error}`);
        }
    });

    socket.on('end', () => {
        // log.debug(`[${id}] Socket closed by client for port ${port}`);
    });

    socket.on('error', (error) => {
        log.error(`[${id}] Socket error: ${error}`);
    });
}

/**
 * Deserializes a buffer into a {@link ServerPacket} instance.
 *
 * @param data - The buffer containing the serialized packet data.
 * @returns The deserialized {@link ServerPacket}.
 */
function parseInitialMessage(data: Buffer): ServerPacket {
    const initialPacket = new ServerPacket();
    initialPacket.deserialize(data);
    return initialPacket;
}

/**
 * Routes an initial server packet to the appropriate handler based on the socket port and returns the serialized response(s).
 *
 * @param id - The unique connection identifier.
 * @param port - The local port number of the incoming connection.
 * @param initialPacket - The parsed server packet to be routed.
 * @returns A buffer containing the serialized response(s) to be sent back to the client.
 *
 * @remark Only port 43300 is currently handled; other ports result in no response.
 */
async function routeInitialMessage(
    id: string,
    port: number,
    initialPacket: ServerPacket,
    log = getServerLogger('gateway.mcotsPortRouter/routeInitialMessage'),
): Promise<Buffer> {
    // Route the initial message to the appropriate handler
    // Messages may be encrypted, this will be handled by the handler

    log.debug(
        `Routing message for port ${port}: ${initialPacket.toHexString()}`,
    );
    let responses: SerializableInterface[] = [];

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
            console.log(`No handler found for port ${port}`);
            break;
    }

    // Send responses back to the client
    log.debug(`[${id}] Sending ${responses.length} responses`);

    // Serialize the responses
    const serializedResponses = responses.map((response) =>
        response.serialize(),
    );

    return Buffer.concat(serializedResponses);
}
