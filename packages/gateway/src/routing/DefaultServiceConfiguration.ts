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
 * Default service configuration for the NPS protocol.
 *
 * This module registers all NPS services with their respective ports.
 * Services are registered using the ServiceRegistry to follow the
 * Open/Closed Principle.
 */

import { receiveLobbyData } from 'rusty-motors-lobby';
import { receiveLoginData, receivePersonaData } from 'rusty-motors-authentication';
import { receiveChatData } from 'rusty-motors-chat';
import { receiveRoomData } from '@rustymotors/rooms';
import type { IServiceRegistry } from './ServiceRegistry.js';

/**
 * Creates the default NPS service configuration.
 *
 * This function registers all the standard NPS services:
 * - Lobby service (port 7003, 9000-9020, 10001)
 * - Login service (port 8226)
 * - Persona service (port 8228)
 * - Chat service (port 8227)
 *
 * @param registry - The service registry to register services in
 */
export function createDefaultServiceConfiguration(
    registry: IServiceRegistry
): void {
    // Lobby service: main lobby and race handoff
    registry.register({
        name: 'lobby',
        ports: [7003, 10001],
        handler: receiveLobbyData,
    });

    // Rooms service: game room ports
    registry.register({
        name: 'rooms',
        ports: Array.from({ length: 21 }, (_, i) => 9000 + i),
        handler: receiveRoomData,
    });

    // Login service
    registry.register({
        name: 'login',
        ports: [8226],
        handler: receiveLoginData,
    });

    // Persona service
    registry.register({
        name: 'persona',
        ports: [8228],
        handler: receivePersonaData,
    });

    // Chat service
    registry.register({
        name: 'chat',
        ports: [8227],
        handler: receiveChatData,
    });
}
