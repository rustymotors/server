import type { PortRouter, PortRouterArgs } from './types.js';
import { getServerLogger } from 'rusty-motors-logger';

/**
 * A map that associates port numbers with their corresponding router functions.
 * Each router function takes a `Socket` object as an argument and returns a `Promise<void>`.
 */
const portRouters = new Map<number, PortRouter>();

/**
 * Associates a router function with a TCP port number.
 *
 * @param port - The TCP port number to register.
 * @param router - The router function to handle socket connections for the specified port.
 *
 * @throws {Error} If {@link port} is not an integer between 0 and 65535.
 */

export function addPortRouter(port: number, router: PortRouter) {
    if (!Number.isInteger(port) || port < 0 || port > 65535) {
        throw new Error(`Invalid port number: ${port}`);
    }
    portRouters.set(port, router);
}
/**
 * Handles incoming socket connections for ports without a registered router.
 *
 * Attaches an error listener to the socket, logs a warning, and terminates the connection.
 *
 * @param taggedSocket - The socket connection that could not be routed.
 */

async function notFoundRouter({
    taggedSocket,
    log = getServerLogger('gateway.notFoundRouter'),
}: PortRouterArgs) {
    taggedSocket.rawSocket.on('error', (error) => {
        console.error(`[${taggedSocket.connectionId}] Socket error: ${error}`);
    });
    taggedSocket.rawSocket.end();
    log.warn(
        `[${taggedSocket.connectionId}] No router found for port ${taggedSocket.rawSocket.localPort}`,
    );
}
/**
 * Returns the router function registered for the specified TCP port, or a fallback if none exists.
 *
 * If no router is registered for the given port, the {@link notFoundRouter} function is returned.
 *
 * @param port - TCP port number to look up.
 * @returns The router function for the port, or {@link notFoundRouter} if not found.
 *
 * @throws {Error} If {@link port} is not an integer between 0 and 65535.
 */

export function getPortRouter(port: number): PortRouter {
    if (!Number.isInteger(port) || port < 0 || port > 65535) {
        throw new Error(`Invalid port number: ${port}`);
    }
    const router = portRouters.get(port);
    if (typeof router === 'undefined') {
        return notFoundRouter;
    }
    return router;
}

/**
 * Removes all port-to-router associations, resetting the port router mapping to empty.
 */
export function clearPortRouters() {
    portRouters.clear();
}
