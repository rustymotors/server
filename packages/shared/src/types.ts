/**
 * @module interfaces
 */

import type { SerializedBufferOld } from './SerializedBufferOld.js';
import type { ServerLogger } from 'rusty-motors-logger';

export type ConnectionRecord = {
    customerId: number;
    sessionKey: string;
    sKey: string;
    contextId: string;
    connectionId: string;
};

/**
 * @exports
 * @interface
 */

export interface DatabaseManager {
    updateSessionKey: (
        arg0: number,
        arg1: string,
        arg2: string,
        arg3: string,
    ) => Promise<void>;
    fetchSessionKeyByCustomerId: (arg0: number) => Promise<ConnectionRecord>;
}

/**
 * @exports
 */
export interface GameMessageOpCode {
    name: string;
    value: number;
    module: 'Lobby' | 'Login';
}

export interface UserRecordMini {
    contextId: string;
    customerId: number;
    profileId: number;
}

/**
 * @exports
 */
export interface RaceLobbyRecord {
    lobbyId: number;
    raceTypeId: number;
    turfId: number;
    riffName: string;
    eTurfName: string;
}

export interface ServiceArgs {
    connectionId: string;
    message: SerializedBufferOld;
    log?: ServerLogger;
}

/**
 * GNU Affero General Public License
 *
 * mcos is a game server, written from scratch, for an old game
 * Copyright (C) <2017>  <Drazi Crendraven>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

export interface KeypressEvent {
    sequence: string;
    name: string;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
}
