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

import type { IDatabaseServices, ServerLogger } from "rusty-motors-shared";
import { SessionStore } from "./stores/SessionStore.js";
import { GameDataStore } from "./stores/GameDataStore.js";
import { AuthStore } from "./stores/AuthStore.js";

export interface DatabaseServicesConfig {
    postgresUrl: string;
    sqlitePath: string;
    logger?: ServerLogger;
}

/**
 * Factory function to create database services
 *
 * This follows the 12-factor app pattern by accepting configuration
 * as parameters rather than reading from environment directly.
 *
 * @param config - Database configuration
 * @returns IDatabaseServices instance with all stores initialized
 */
export function createDatabaseServices(
    config: DatabaseServicesConfig,
): IDatabaseServices {
    const { postgresUrl, sqlitePath, logger } = config;

    return {
        session: new SessionStore(),
        gameData: new GameDataStore(postgresUrl),
        auth: new AuthStore(sqlitePath, postgresUrl, logger),
    };
}
