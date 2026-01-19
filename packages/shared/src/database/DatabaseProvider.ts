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

import type {
    IDatabaseServices,
    ISessionStore,
    IGameDataStore,
    IAuthStore,
} from "./interfaces.js";

/**
 * Global database provider following the 12-factor app pattern.
 *
 * This provider allows services (login, lobby, transaction) to access
 * database stores without tight coupling. Services can get the store
 * instances they need through this provider.
 *
 * Usage:
 * 1. At application startup, create database services and register them:
 *    ```
 *    const services = createDatabaseServices({ postgresUrl, sqlitePath });
 *    databaseProvider.register(services);
 *    ```
 *
 * 2. In handlers/services, access stores via the provider:
 *    ```
 *    const sessionStore = databaseProvider.getSessionStore();
 *    const user = await sessionStore.getUser(userId);
 *    ```
 *
 * 3. In tests, register mock implementations:
 *    ```
 *    databaseProvider.register({ session: mockSession, ... });
 *    ```
 */
class DatabaseProvider {
    private services: IDatabaseServices | null = null;

    /**
     * Registers database services instance
     *
     * @param services - The database services to register
     */
    register(services: IDatabaseServices): void {
        this.services = services;
    }

    /**
     * Unregisters the database services
     * Primarily used for testing cleanup
     */
    unregister(): void {
        this.services = null;
    }

    /**
     * Gets the session store for runtime session/connection management
     *
     * @returns The session store instance
     * @throws Error if provider not initialized
     */
    getSessionStore(): ISessionStore {
        if (!this.services) {
            throw new Error(
                "DatabaseProvider not initialized. Call register() first.",
            );
        }
        return this.services.session;
    }

    /**
     * Gets the game data store for persistent game data (vehicles, parts, players)
     *
     * @returns The game data store instance
     * @throws Error if provider not initialized
     */
    getGameDataStore(): IGameDataStore {
        if (!this.services) {
            throw new Error(
                "DatabaseProvider not initialized. Call register() first.",
            );
        }
        return this.services.gameData;
    }

    /**
     * Gets the auth store for authentication and local session cache
     *
     * @returns The auth store instance
     * @throws Error if provider not initialized
     */
    getAuthStore(): IAuthStore {
        if (!this.services) {
            throw new Error(
                "DatabaseProvider not initialized. Call register() first.",
            );
        }
        return this.services.auth;
    }

    /**
     * Checks if database services are registered
     *
     * @returns true if services are registered
     */
    isRegistered(): boolean {
        return this.services !== null;
    }
}

// Export singleton instance
export const databaseProvider = new DatabaseProvider();
