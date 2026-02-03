import type { PortRouter, PortRouterArgs } from "./types.js";
import { getServerLogger } from "rusty-motors-shared";
import type { PortRouterRegistry } from "./routing/PortRouterRegistry.js";

/**
 * A map that associates port numbers with their corresponding router functions.
 * Each router function takes a `Socket` object as an argument and returns a `Promise<void>`.
 * 
 * @deprecated This global map is maintained for backward compatibility.
 * New code should use PortRouterRegistry instead.
 */
const portRouters = new Map<number, PortRouter>();

/**
 * Global registry instance for port routers.
 * This is the source of truth for port router mappings.
 */
let globalRegistry: PortRouterRegistry | null = null;

/**
 * Sets the global port router registry.
 * This allows the Gateway to use PortRouterRegistry while maintaining
 * backward compatibility with the existing portRouters API.
 *
 * @param registry - The PortRouterRegistry instance to use
 */
export function setGlobalPortRouterRegistry(registry: PortRouterRegistry): void {
	globalRegistry = registry;
	// Sync registry mappings to the global map for backward compatibility
	syncRegistryToGlobalMap(registry);
}

/**
 * Syncs the registry mappings to the global portRouters map
 *
 * @param registry - The PortRouterRegistry to sync from
 */
function syncRegistryToGlobalMap(registry: PortRouterRegistry): void {
	const mappings = registry.getMappings();
	portRouters.clear();
	for (const { port, router } of mappings) {
		portRouters.set(port, router);
	}
}

/**
 * Registers a router function for a specific port.
 *
 * @param port - The port number to associate with the router.
 * @param router - A function that handles the socket connection for the specified port.
 *
 * @deprecated Use PortRouterRegistry.registerPort() instead.
 * This function is maintained for backward compatibility.
 */
export function addPortRouter(port: number, router: PortRouter) {
	if (!Number.isInteger(port) || port < 0 || port > 65535) {
		throw new Error(`Invalid port number: ${port}`);
	}
	portRouters.set(port, router);
	
	// If global registry is set, also register there
	if (globalRegistry) {
		try {
			globalRegistry.registerPort(port, router);
		} catch (error) {
			// If port already registered in registry, that's okay - we're syncing
			// Just ensure the global map has it
		}
	}
}
/**
 * Handles the case where no router is found for the given socket.
 *
 * This function will terminate the socket connection and throw an error
 * indicating that no router was found for the port.
 *
 * @param taggedSocket - The socket connection that could not be routed.
 * @throws {Error} Throws an error indicating no router was found for the port.
 */

async function notFoundRouter({
	taggedSocket,
	log = getServerLogger("gateway.notFoundRouter"),
}: PortRouterArgs) {
	taggedSocket.socket.on("error", (error) => {
		log.error(`[${taggedSocket.connectionId}] Socket error: ${error}`);
	});
	taggedSocket.socket.end();
	log.warn(
		`[${taggedSocket.connectionId}] No router found for port ${taggedSocket.socket.localPort}`,
	);
}
/**
 * Retrieves the router function associated with a given port.
 *
 * @param port - The port number for which to retrieve the router.
 * @returns A function that takes a socket and returns a promise resolving to void.
 *          If no router is found for the given port, returns the `notFoundRouter` function.
 */
export function getPortRouter(port: number): PortRouter {
	if (!Number.isInteger(port) || port < 0 || port > 65535) {
		throw new Error(`Invalid port number: ${port}`);
	}
	
	// Try global registry first if available
	if (globalRegistry) {
		const router = globalRegistry.getRouter(port);
		if (router) {
			return router;
		}
	}
	
	// Fall back to global map for backward compatibility
	const router = portRouters.get(port);
	if (typeof router === "undefined") {
		return notFoundRouter;
	}
	return router;
}

/**
 * Clears all entries from the portRouters map.
 *
 * This function removes all key-value pairs from the portRouters map,
 * effectively resetting it to an empty state.
 */
export function clearPortRouters() {
	portRouters.clear();
}
