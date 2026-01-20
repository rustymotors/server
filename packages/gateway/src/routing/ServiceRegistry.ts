// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

/**
 * Service Registry for routing messages to appropriate service handlers.
 *
 * This implements the Open/Closed Principle - the routing mechanism is open
 * for extension (new services can be registered) but closed for modification
 * (adding new services doesn't require changing the router code).
 */

import type { ServerLogger } from 'rusty-motors-shared';

/**
 * Common serializable interface for messages.
 */
export interface Serializable {
    serialize(): Buffer;
}

/**
 * Handler function type for processing messages on a service.
 * Uses a flexible type to accommodate different handler signatures across packages.
 *
 * The handler receives:
 * - connectionId: unique identifier for the connection
 * - message: the incoming message (type varies by service)
 * - log: optional logger instance
 *
 * Returns a promise with connectionId and array of response messages.
 */
export type ServiceHandler = (args: {
    connectionId: string;
    message: Serializable;
    log?: ServerLogger;
}) => Promise<{ connectionId: string; messages: Serializable[] }>;

/**
 * Configuration for a service that handles messages on specific ports.
 */
export interface ServiceConfig {
    /** Human-readable name for the service (for logging) */
    name: string;
    /** Port numbers this service handles */
    ports: number[];
    /**
     * The handler function for processing messages.
     * Type is relaxed to allow different service handler signatures.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: (...args: any[]) => Promise<any>;
}

/**
 * Interface for the service registry.
 */
export interface IServiceRegistry {
    register(config: ServiceConfig): void;
    getHandler(port: number): ServiceConfig['handler'] | undefined;
    getServiceName(port: number): string | undefined;
    getRegisteredPorts(): number[];
    clear(): void;
}

/**
 * Validates that a port number is valid (0-65535, integer).
 */
function validatePort(port: number): void {
    if (!Number.isInteger(port) || port < 0 || port > 65535) {
        throw new Error(`Invalid port number: ${port}`);
    }
}

/**
 * Registry that maps ports to service handlers.
 *
 * This allows new services to be added without modifying the routing code,
 * following the Open/Closed Principle.
 *
 * @example
 * ```typescript
 * const registry = new ServiceRegistry();
 *
 * registry.register({
 *     name: 'lobby',
 *     ports: [7003],
 *     handler: receiveLobbyData
 * });
 *
 * registry.register({
 *     name: 'login',
 *     ports: [8226],
 *     handler: receiveLoginData
 * });
 *
 * // In the router:
 * const handler = registry.getHandler(port);
 * if (handler) {
 *     const result = await handler({ connectionId, message, log });
 * }
 * ```
 */
export class ServiceRegistry implements IServiceRegistry {
    private readonly handlers = new Map<number, ServiceConfig>();

    /**
     * Registers a service configuration.
     *
     * @param config - The service configuration to register
     * @throws {Error} If any port is invalid or already registered
     */
    register(config: ServiceConfig): void {
        // Validate all ports first
        for (const port of config.ports) {
            validatePort(port);
            if (this.handlers.has(port)) {
                throw new Error(
                    `Port ${port} already registered to service '${this.handlers.get(port)?.name}'`
                );
            }
        }

        // Register all ports
        for (const port of config.ports) {
            this.handlers.set(port, config);
        }
    }

    /**
     * Gets the handler function for a specific port.
     *
     * @param port - The port to look up
     * @returns The handler function, or undefined if not registered
     */
    getHandler(port: number): ServiceHandler | undefined {
        return this.handlers.get(port)?.handler;
    }

    /**
     * Gets the service name for a specific port.
     *
     * @param port - The port to look up
     * @returns The service name, or undefined if not registered
     */
    getServiceName(port: number): string | undefined {
        return this.handlers.get(port)?.name;
    }

    /**
     * Gets all registered port numbers.
     *
     * @returns Array of registered port numbers
     */
    getRegisteredPorts(): number[] {
        return Array.from(this.handlers.keys());
    }

    /**
     * Clears all registered services.
     */
    clear(): void {
        this.handlers.clear();
    }
}

/**
 * Global service registry instance.
 * Services should register themselves during initialization.
 */
let globalServiceRegistry: ServiceRegistry | undefined;

/**
 * Gets the global service registry instance, creating it if needed.
 */
export function getServiceRegistry(): ServiceRegistry {
    if (!globalServiceRegistry) {
        globalServiceRegistry = new ServiceRegistry();
    }
    return globalServiceRegistry;
}

/**
 * Sets the global service registry instance.
 * Useful for testing or custom configurations.
 */
export function setServiceRegistry(registry: ServiceRegistry): void {
    globalServiceRegistry = registry;
}

/**
 * Clears the global service registry.
 * Useful for testing.
 */
export function clearServiceRegistry(): void {
    globalServiceRegistry?.clear();
    globalServiceRegistry = undefined;
}
