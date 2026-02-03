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
 * Initializes the service registry with default NPS services.
 *
 * This module provides a single entry point for initializing the service
 * registry with all default services. Call this during server startup.
 */

import { getServiceRegistry } from './ServiceRegistry.js';
import { createDefaultServiceConfiguration } from './DefaultServiceConfiguration.js';

/**
 * Initializes the global service registry with default NPS services.
 *
 * This should be called once during server startup, after the database
 * services are initialized but before the gateway starts accepting connections.
 *
 * @example
 * ```typescript
 * import { initializeServiceRegistry } from 'rusty-motors-gateway';
 *
 * // In main()
 * initializeServiceRegistry();
 * ```
 */
export function initializeServiceRegistry(): void {
    const registry = getServiceRegistry();
    createDefaultServiceConfiguration(registry);
}
