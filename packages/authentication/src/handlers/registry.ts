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
 * Authentication Handler Registry
 *
 * This module uses the MessageHandlerRegistry to register all authentication message handlers.
 * Includes both login handlers (port 8226) and persona handlers (port 8228).
 */

import { AUTH_MESSAGE_IDS } from 'rusty-motors-shared';
import type { ServerLogger, LegacyMessage } from 'rusty-motors-shared';
import type { BytableMessage, BytableBuffer } from '@rustymotors/binary';

// Login handlers
import { login } from '../login/login.js';

// Persona handlers
import { _selectGamePersona } from '../persona/_selectGamePersona.js';
import { _gameLogout } from '../persona/_gameLogout.js';
import { getPersonaInfo } from '../persona/handlers/getPersonaInfo.js';
import { validatePersonaName } from '../persona/handlers/validatePersonaName.js';
import { _getFirstBuddy } from '../persona/_getFirstBuddy.js';
import { getPersonaMaps } from '../persona/getPersonaMaps.js';

/**
 * Handler arguments type for authentication handlers.
 */
export interface AuthHandlerArgs {
    connectionId: string;
    message: BytableMessage | LegacyMessage;
    log?: ServerLogger;
}

/**
 * Handler result type for authentication handlers.
 */
export interface AuthHandlerResult {
    connectionId: string;
    messages: BytableMessage[] | BytableBuffer[];
}

// Handlers have varied message parameter subtypes that can't be unified statically.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AuthHandlerFn = (args: any) => Promise<AuthHandlerResult>;

interface AuthHandlerEntry {
    opCode: number;
    name: string;
    handler: AuthHandlerFn;
}

class AuthRegistry {
    private readonly handlers = new Map<number, AuthHandlerEntry>();

    register(entry: AuthHandlerEntry): this {
        this.handlers.set(entry.opCode, entry);
        return this;
    }

    getHandler(opCode: number): AuthHandlerEntry | undefined {
        return this.handlers.get(opCode);
    }
}

/**
 * Creates and returns a configured authentication handler registry.
 */
export function createAuthHandlerRegistry(): AuthRegistry {
    const registry = new AuthRegistry();

    // Login handlers (port 8226)
    registry.register({
        opCode: AUTH_MESSAGE_IDS.USER_LOGIN,
        name: 'UserLogin',
        handler: login,
    });

    // Persona handlers (port 8228)
    registry.register({
        opCode: AUTH_MESSAGE_IDS.GAME_LOGIN,
        name: 'Game login',
        handler: _selectGamePersona,
    });

    registry.register({
        opCode: AUTH_MESSAGE_IDS.GAME_LOGOUT,
        name: 'Game logout',
        handler: _gameLogout,
    });

    registry.register({
        opCode: AUTH_MESSAGE_IDS.GET_PERSONA_INFO,
        name: 'Get persona info',
        handler: getPersonaInfo,
    });

    registry.register({
        opCode: AUTH_MESSAGE_IDS.GET_PERSONA_MAPS,
        name: 'Get persona maps',
        handler: getPersonaMaps,
    });

    registry.register({
        opCode: AUTH_MESSAGE_IDS.VALIDATE_PERSONA_NAME,
        name: 'Validate persona name',
        handler: validatePersonaName,
    });

    registry.register({
        opCode: AUTH_MESSAGE_IDS.GET_FIRST_BUDDY,
        name: 'Get first buddy',
        handler: _getFirstBuddy,
    });

    return registry;
}

/**
 * Singleton instance of the authentication handler registry.
 */
let authRegistryInstance: AuthRegistry | null = null;

/**
 * Gets the singleton authentication handler registry instance.
 */
export function getAuthHandlerRegistry(): AuthRegistry {
    if (!authRegistryInstance) {
        authRegistryInstance = createAuthHandlerRegistry();
    }
    return authRegistryInstance;
}

/**
 * Clears the singleton authentication handler registry.
 * Useful for testing.
 */
export function clearAuthHandlerRegistry(): void {
    authRegistryInstance = null;
}
