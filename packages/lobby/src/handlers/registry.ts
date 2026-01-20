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
 * Lobby Handler Registry
 *
 * This module uses the MessageHandlerRegistry to register all lobby message handlers.
 * Following the Single Responsibility Principle, each handler is responsible for
 * processing a specific message type.
 */

import { MessageHandlerRegistry } from 'rusty-motors-shared';
import type { BytableMessage, BytableBuffer } from '@rustymotors/binary';
import type { ServerLogger } from 'rusty-motors-shared';

import { handleEncryptedNPSCommand } from './encryptedCommand.js';
import { handleTrackingPing } from './handleTrackingPing.js';
import { _npsRequestGameConnectServer } from './requestConnectGameServer.js';
import { handleOpenCommChannel } from './handleOpenCommChannel.js';
import { handleUdpStatus } from './handlUdpStatus.js';

/**
 * Handler arguments type for lobby handlers.
 */
export interface LobbyHandlerArgs {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}

/**
 * Handler result type for lobby handlers.
 */
export interface LobbyHandlerResult {
    connectionId: string;
    messages: BytableBuffer[];
}

/**
 * Creates and returns a configured lobby handler registry.
 *
 * @returns A MessageHandlerRegistry configured with all lobby handlers
 */
export function createLobbyHandlerRegistry(): MessageHandlerRegistry<
    LobbyHandlerArgs,
    LobbyHandlerResult
> {
    const registry = new MessageHandlerRegistry<LobbyHandlerArgs, LobbyHandlerResult>('lobby');

    // User login request (0x100)
    registry.register({
        opCode: 0x100,
        name: 'User login',
        handler: _npsRequestGameConnectServer,
    });

    // Open communication channel (0x106)
    registry.register({
        opCode: 0x106,
        name: 'PT_OPEN_COMM_CHANNEL',
        handler: handleOpenCommChannel,
    });

    // UDP status (0x125)
    registry.register({
        opCode: 0x125,
        name: 'PT_UDP_STATUS',
        handler: handleUdpStatus,
    });

    // Encrypted command (0x1101)
    registry.register({
        opCode: 0x1101,
        name: 'Encrypted command',
        handler: handleEncryptedNPSCommand,
    });

    // Tracking ping (0x217)
    registry.register({
        opCode: 0x217,
        name: 'Tracking ping',
        handler: handleTrackingPing,
    });

    return registry;
}

/**
 * Singleton instance of the lobby handler registry.
 * Lazily initialized on first access.
 */
let lobbyRegistryInstance: MessageHandlerRegistry<LobbyHandlerArgs, LobbyHandlerResult> | null = null;

/**
 * Gets the singleton lobby handler registry instance.
 *
 * @returns The lobby handler registry
 */
export function getLobbyHandlerRegistry(): MessageHandlerRegistry<
    LobbyHandlerArgs,
    LobbyHandlerResult
> {
    if (!lobbyRegistryInstance) {
        lobbyRegistryInstance = createLobbyHandlerRegistry();
    }
    return lobbyRegistryInstance;
}

/**
 * Clears the singleton lobby handler registry.
 * Useful for testing.
 */
export function clearLobbyHandlerRegistry(): void {
    lobbyRegistryInstance = null;
}
