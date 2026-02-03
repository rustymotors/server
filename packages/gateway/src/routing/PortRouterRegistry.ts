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

import type { PortRouter } from "../types.js";

/**
 * Represents a mapping between a port number and its router
 */
export interface PortMapping {
	port: number;
	router: PortRouter;
}

/**
 * Interface for port router configuration
 */
export interface IPortRouterRegistry {
	registerPort(port: number, router: PortRouter): void;
	registerPortRange(start: number, end: number, router: PortRouter): void;
	getRouter(port: number): PortRouter | undefined;
	getMappings(): PortMapping[];
	clear(): void;
}

/**
 * Validates that a port number is valid (0-65535, integer)
 *
 * @param port - The port number to validate
 * @throws {Error} If the port is invalid
 */
function validatePort(port: number): void {
	if (!Number.isInteger(port) || port < 0 || port > 65535) {
		throw new Error(`Invalid port number: ${port}`);
	}
}

/**
 * Manages port-to-router mappings
 *
 * This class handles the registration and retrieval of port routers,
 * allowing ports to be registered individually or in ranges.
 */
export class PortRouterRegistry implements IPortRouterRegistry {
	private readonly mappings: Map<number, PortRouter> = new Map();

	/**
	 * Registers a single port with a router
	 *
	 * @param port - The port number to register (0-65535)
	 * @param router - The router function to handle connections on this port
	 * @throws {Error} If the port is invalid or already registered
	 */
	registerPort(port: number, router: PortRouter): void {
		validatePort(port);

		if (this.mappings.has(port)) {
			throw new Error(`Port ${port} already registered`);
		}

		this.mappings.set(port, router);
	}

	/**
	 * Registers a range of ports with the same router
	 *
	 * @param start - The starting port number (inclusive)
	 * @param end - The ending port number (inclusive)
	 * @param router - The router function to handle connections on these ports
	 * @throws {Error} If any port is invalid, start > end, or any port is already registered
	 */
	registerPortRange(start: number, end: number, router: PortRouter): void {
		validatePort(start);
		validatePort(end);

		if (start > end) {
			throw new Error("Start port must be less than or equal to end port");
		}

		// Check for conflicts before registering
		for (let port = start; port <= end; port++) {
			if (this.mappings.has(port)) {
				throw new Error(`Port ${port} already registered`);
			}
		}

		// Register all ports in the range
		for (let port = start; port <= end; port++) {
			this.mappings.set(port, router);
		}
	}

	/**
	 * Gets the router for a specific port
	 *
	 * @param port - The port number to look up
	 * @returns The router function for the port, or undefined if not registered
	 * @throws {Error} If the port is invalid
	 */
	getRouter(port: number): PortRouter | undefined {
		validatePort(port);
		return this.mappings.get(port);
	}

	/**
	 * Gets all port mappings
	 *
	 * @returns An array of PortMapping objects representing all registered ports
	 */
	getMappings(): PortMapping[] {
		return Array.from(this.mappings.entries()).map(([port, router]) => ({
			port,
			router,
		}));
	}

	/**
	 * Clears all registered port mappings
	 */
	clear(): void {
		this.mappings.clear();
	}
}
