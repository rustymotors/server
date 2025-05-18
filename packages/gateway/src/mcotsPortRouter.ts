import type { TaggedSocket } from './socketUtility.js';
import {
    ServerPacket,
    type SerializableInterface,
} from 'rusty-motors-shared-packets';
import { receiveTransactionsData } from 'rusty-motors-transactions';
import * as Sentry from '@sentry/node';
import { getServerLogger, ServerLogger } from 'rusty-motors-logger';

/**
 * Pure function to parse the initial message buffer into a ServerPacket.
 */
export function parseInitialMessage(data: Buffer): ServerPacket {
    const initialPacket = new ServerPacket();
    initialPacket.deserialize(data);
    return initialPacket;
}

/**
 * Pure function to route the initial message and return a Buffer response.
 * Logger is injected for testability.
 */
export async function routeInitialMessage(
    id: string,
    port: number,
    initialPacket: ServerPacket,
    log: ServerLogger,
): Promise<Buffer> {
    log.debug(
        `Routing message for port ${port}: ${initialPacket.toHexString()}`,
    );
    let responses: SerializableInterface[] = [];
    switch (port) {
        case 43300:
            responses = (
                await receiveTransactionsData({
                    connectionId: id,
                    message: initialPacket,
                })
            ).messages;
            break;
        default:
            log.info(`[${id}] No handler found for port ${port}`);
            break;
    }
    log.debug(`[${id}] Sending ${responses.length} responses`);
    const serializedResponses = responses.map((response) =>
        response.serialize(),
    );
    return Buffer.concat(serializedResponses);
}

/**
 * Pure function to handle incoming socket data. All dependencies are injected.
 */
export async function handleMcotsData({
    id,
    port,
    data,
    socket,
    log,
    parseInitialMessageFn = parseInitialMessage,
    routeInitialMessageFn = routeInitialMessage,
}: {
    id: string;
    port: number;
    data: Buffer;
    socket: NodeJS.Socket;
    log: ServerLogger;
    parseInitialMessageFn?: (data: Buffer) => ServerPacket;
    routeInitialMessageFn?: (
        id: string,
        port: number,
        initialPacket: ServerPacket,
        log: ServerLogger,
    ) => Promise<Buffer>;
}) {
    try {
        log.debug(`[${id}] Received data: ${data.toString('hex')}`);
        const initialPacket = parseInitialMessageFn(data);
        log.debug(`[${id}] Initial packet(str): ${initialPacket}`);
        log.debug(
            `[${id}] initial Packet(hex): ${initialPacket.toHexString()}`,
        );
        const response = await routeInitialMessageFn(
            id,
            port,
            initialPacket,
            log,
        );
        log.debug(`[${id}] Sending response: ${response.toString('hex')}`);
        socket.write(response);
    } catch (error) {
        Sentry.captureException(error);
        log.error(`[${id}] Error handling data: ${error}`);
    }
}

/**
 * Main entry point. Wires up the socket and injects dependencies.
 * This is the only impure function.
 */
export async function mcotsPortRouter({
    taggedSocket,
    log = getServerLogger('gateway.mcotsPortRouter'),
    parseInitialMessageFn = parseInitialMessage,
    routeInitialMessageFn = routeInitialMessage,
}: {
    taggedSocket: TaggedSocket;
    log?: ServerLogger;
    parseInitialMessageFn?: (data: Buffer) => ServerPacket;
    routeInitialMessageFn?: (
        id: string,
        port: number,
        initialPacket: ServerPacket,
        log: ServerLogger,
    ) => Promise<Buffer>;
}): Promise<void> {
    const { rawSocket: socket, connectionId: id } = taggedSocket;
    const port = socket.localPort || 0;
    if (port === 0) {
        log.error(`[${id}] Local port is undefined`);
        socket.end();
        return;
    }
    log.debug(`[${id}] MCOTS port router started for port ${port}`);
    socket.on('data', async (data) => {
        await handleMcotsData({
            id,
            port,
            data,
            socket,
            log,
            parseInitialMessageFn,
            routeInitialMessageFn,
        });
    });
    socket.on('end', () => {
        // log.debug(`[${id}] Socket closed by client for port ${port}`);
    });
    socket.on('error', (error) => {
        log.error(`[${id}] Socket error: ${error}`);
    });
}
