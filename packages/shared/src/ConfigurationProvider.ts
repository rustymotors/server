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

import type { Configuration } from "./Configuration.js";
import { getServerConfiguration } from "./Configuration.js";

/**
 * Interface for objects that provide Gateway configuration
 * This allows services to access Gateway-specific configuration
 * without tight coupling to the Gateway package.
 */
export interface GatewayConfigurationProvider {
	getSharedConfig(): Configuration;
	getLoginServerPort(): number;
	getLobbyServerPort(): number;
	getDiagnosticServerPort(): number;
	getWebPort(): number;
}

/**
 * Global configuration provider
 *
 * This allows services (login, lobby, transaction) to access
 * GatewayConfiguration without tight coupling. Services can
 * get the shared Configuration object they need, and optionally
 * access Gateway-specific configuration values.
 */
class ConfigurationProvider {
	private gatewayConfigProvider: GatewayConfigurationProvider | null = null;

	/**
	 * Registers a GatewayConfigurationProvider instance
	 *
	 * @param provider - The provider to register
	 */
	register(provider: GatewayConfigurationProvider): void {
		this.gatewayConfigProvider = provider;
	}

	/**
	 * Unregisters the GatewayConfigurationProvider
	 */
	unregister(): void {
		this.gatewayConfigProvider = null;
	}

	/**
	 * Gets the shared Configuration object
	 *
	 * Returns the Configuration from GatewayConfigurationProvider if available,
	 * otherwise falls back to getServerConfiguration().
	 *
	 * @returns The shared Configuration object
	 */
	getSharedConfiguration(): Configuration {
		if (this.gatewayConfigProvider) {
			return this.gatewayConfigProvider.getSharedConfig();
		}
		// Fallback to direct call if provider not registered
		return getServerConfiguration();
	}

	/**
	 * Gets the GatewayConfigurationProvider if registered
	 *
	 * @returns The provider or null if not registered
	 */
	getGatewayConfigurationProvider(): GatewayConfigurationProvider | null {
		return this.gatewayConfigProvider;
	}

	/**
	 * Checks if GatewayConfigurationProvider is registered
	 *
	 * @returns true if provider is registered
	 */
	isRegistered(): boolean {
		return this.gatewayConfigProvider !== null;
	}
}

// Export singleton instance
export const configurationProvider = new ConfigurationProvider();
