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

import type { Configuration, GatewayConfigurationProvider } from "rusty-motors-shared";
import { configurationProvider } from "rusty-motors-shared";

/**
 * Gateway-specific configuration options
 */
export interface GatewayConfigOptions {
	sharedConfig: Configuration;
	tcpPorts?: number[];
	udpPorts?: number[];
	webPort?: number;
	backlogAllowedCount?: number;
	loginServerPort?: number;
	lobbyServerPort?: number;
	diagnosticServerPort?: number;
}

/**
 * Interface for Gateway configuration
 */
export interface IGatewayConfiguration extends GatewayConfigurationProvider {
	getTcpPorts(): number[];
	getUdpPorts(): number[];
	getBacklogAllowedCount(): number;
}

/**
 * Manages Gateway-specific configuration
 *
 * This class wraps the shared Configuration and manages Gateway-specific
 * settings like ports and backlog. It provides a clean interface for
 * accessing both shared server configuration and Gateway-specific config.
 */
export class GatewayConfiguration implements IGatewayConfiguration {
	private readonly sharedConfig: Configuration;
	private readonly tcpPorts: number[];
	private readonly udpPorts: number[];
	private readonly webPort: number;
	private readonly backlogAllowedCount: number;
	private readonly loginServerPort: number;
	private readonly lobbyServerPort: number;
	private readonly diagnosticServerPort: number;

	constructor(options: GatewayConfigOptions) {
		this.sharedConfig = options.sharedConfig;
		this.tcpPorts = options.tcpPorts ?? [];
		this.udpPorts = options.udpPorts ?? [];
		this.webPort = options.webPort ?? 3000;
		this.backlogAllowedCount = options.backlogAllowedCount ?? 0;
		// Shard list ports - defaults match current hardcoded values
		this.loginServerPort = options.loginServerPort ?? 8226;
		this.lobbyServerPort = options.lobbyServerPort ?? 7003;
		this.diagnosticServerPort = options.diagnosticServerPort ?? 80;

		// Register with global provider so services can access it
		// This allows login, lobby, and transaction services to access configuration
		configurationProvider.register(this);
	}

	/**
	 * Gets the TCP ports to listen on
	 *
	 * @returns A copy of the TCP ports array
	 */
	getTcpPorts(): number[] {
		return [...this.tcpPorts];
	}

	/**
	 * Gets the UDP ports to listen on
	 *
	 * @returns A copy of the UDP ports array
	 */
	getUdpPorts(): number[] {
		return [...this.udpPorts];
	}

	/**
	 * Gets the web server port
	 *
	 * @returns The web server port number (default: 3000)
	 */
	getWebPort(): number {
		return this.webPort;
	}

	/**
	 * Gets the backlog allowed count for TCP servers
	 *
	 * @returns The backlog count (default: 0)
	 */
	getBacklogAllowedCount(): number {
		return this.backlogAllowedCount;
	}

	/**
	 * Gets the shared server configuration
	 *
	 * This provides access to the shared Configuration object
	 * which contains server-level settings like certificates, host, etc.
	 *
	 * @returns The shared Configuration object
	 */
	getSharedConfig(): Configuration {
		return this.sharedConfig;
	}

	/**
	 * Gets the login server port for shard list
	 *
	 * This is the port used for login server connections (default: 8226)
	 *
	 * @returns The login server port number
	 */
	getLoginServerPort(): number {
		return this.loginServerPort;
	}

	/**
	 * Gets the lobby server port for shard list
	 *
	 * This is the port used for lobby server connections (default: 7003)
	 *
	 * @returns The lobby server port number
	 */
	getLobbyServerPort(): number {
		return this.lobbyServerPort;
	}

	/**
	 * Gets the diagnostic server port for shard list
	 *
	 * This is the port used for diagnostic server connections (default: 80)
	 *
	 * @returns The diagnostic server port number
	 */
	getDiagnosticServerPort(): number {
		return this.diagnosticServerPort;
	}
}
