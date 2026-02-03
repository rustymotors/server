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
    ConnectionRecord,
    IRunningServerInfo,
    ISessionStore,
} from "rusty-motors-shared";
import type { UserInfo } from "rusty-motors-shared";

/**
 * In-memory session store implementation
 * Manages runtime connection sessions, user state, and game servers
 */
export class SessionStore implements ISessionStore {
    private sessions: ConnectionRecord[] = [];
    private users: Map<number, UserInfo> = new Map();
    private connections: Map<string, number> = new Map();
    private gameServers: Map<number, IRunningServerInfo> = new Map();

    async updateSessionKey(
        customerId: number,
        sessionKey: string,
        contextId: string,
        connectionId: string,
    ): Promise<void> {
        const sKey = sessionKey.slice(0, 16);

        const updatedSession: ConnectionRecord = {
            customerId,
            sessionKey,
            sKey,
            contextId,
            connectionId,
        };

        const recordIndex = this.sessions.findIndex(
            (session) => session.customerId === customerId,
        );

        if (recordIndex >= 0) {
            this.sessions.splice(recordIndex, 1, updatedSession);
        } else {
            this.sessions.push(updatedSession);
        }
    }

    async fetchSessionKeyByCustomerId(
        customerId: number,
    ): Promise<ConnectionRecord> {
        const record = this.sessions.find(
            (session) => session.customerId === customerId,
        );
        if (typeof record === "undefined") {
            throw new Error(`Session key not found for customer ${customerId}`);
        }
        return record;
    }

    async fetchSessionKeyByConnectionId(
        connectionId: string,
    ): Promise<ConnectionRecord> {
        const record = this.sessions.find(
            (session) => session.connectionId === connectionId,
        );
        if (typeof record === "undefined") {
            throw new Error(
                `Session key not found for connection ${connectionId}`,
            );
        }
        return record;
    }

    async updateUser(user: {
        userId: number;
        userInfo: UserInfo;
    }): Promise<void> {
        this.users.set(user.userId, user.userInfo);
    }

    async getUser(userId: number): Promise<UserInfo | undefined> {
        return this.users.get(userId);
    }

    async updateConnection(
        connectionId: string,
        userId: number,
    ): Promise<void> {
        this.connections.set(connectionId, userId);
    }

    async findUserByConnectionId(
        connectionId: string,
    ): Promise<number | undefined> {
        return this.connections.get(connectionId);
    }

    async updateGameServer(
        commId: number,
        gameServer: IRunningServerInfo,
    ): Promise<void> {
        this.gameServers.set(commId, gameServer);
    }

    async getGameServers(): Promise<IRunningServerInfo[]> {
        return Array.from(this.gameServers.values());
    }
}
