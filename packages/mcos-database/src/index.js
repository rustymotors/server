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
 * This class abstracts database methods
 * @class
 */
export class DatabaseManager {
    /** @type {import('mcos/shared').TSession[]} */
    sessions = [];

    /** @type {import('./models/Lobby.js').Lobby[]} */
    lobbies = [];

    /**
     *
     *
     * @private
     * @static
     * @type {import("mcos/shared").IDatabaseManager}
     * @memberof DatabaseManager
     */
    static _instance;

    /** @type {import("mcos/shared").TServerLogger} */
    #log;

    /**
     * Creates an instance of DatabaseManager.
     *
     * Please use {@link DatabaseManager.getInstance()} instead
     * @param {import("mcos/shared").TServerLogger} log
     * @memberof DatabaseManager
     */
    constructor(log) {
        this.#log = log;
    }
    /**
     * Return the instance of the DatabaseManager class
     * @param {import("mcos/shared").TServerLogger} log
     * @returns {import("mcos/shared").IDatabaseManager}
     */
    static getInstance(log) {
        if (!DatabaseManager._instance) {
            DatabaseManager._instance = new DatabaseManager(log);
        }
        const self = DatabaseManager._instance;
        return self;
    }

    /**
     * Locate customer session encryption key in the database
     * @param {number} customerId
     * @returns {Promise<import("mcos/shared").TSessionRecord>}
     */
    async fetchSessionKeyByCustomerId(customerId) {
        const record = this.sessions.find((session) => {
            return session.customerId === customerId;
        });
        if (typeof record === "undefined") {
            const err = new Error(
                "Error fetching session key by customer id: not found"
            );
            this.#log.error(err);
            throw err;
        }
        return record;
    }

    /**
     * Locate customer session encryption key in the database
     * @param {string} connectionId
     * @returns {Promise<import('mcos/shared').TSessionRecord>}
     */
    async fetchSessionKeyByConnectionId(connectionId) {
        const record = await this.sessions.find((session) => {
            return session.connectionId === connectionId;
        });
        if (typeof record === "undefined") {
            const err = new Error(
                "Error fetching session key by customer id: not found"
            );
            this.#log.error(err);
            throw err;
        }
        return record;
    }

    /**
     * Create or overwrite a customer's session key record
     * @param {number} customerId
     * @param {string} sessionKey
     * @param {string} contextId
     * @param {string} connectionId
     * @returns {Promise<void>}
     */
    async updateSessionKey(customerId, sessionKey, contextId, connectionId) {
        const sKey = sessionKey.slice(0, 16);

        /** @type {import('mcos/shared').TSession} */
        const updatedSession = {
            customerId,
            sessionKey,
            sKey,
            contextId,
            connectionId,
        };

        const record = await this.sessions.findIndex((session) => {
            return session.customerId === customerId;
        });
        if (typeof record === "undefined") {
            const err = new Error(
                "Error updating session key: existing key not found"
            );
            this.#log.error(err);
            throw err;
        }
        this.sessions.splice(record, 1, updatedSession);

        return;
    }
}
