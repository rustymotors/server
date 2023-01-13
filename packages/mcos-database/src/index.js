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

import log from '../../../log.js'


/**
 * This class abstracts database methods
 * @class
 */
export class DatabaseManager {
    /** @type {import("./models/Session.js").Session[]} */
    sessions = []

    /** @type {import('./models/Lobby.js').Lobby[]} */
    lobbies = []

    /**
     *
     *
     * @private
     * @static
     * @type {DatabaseManager}
     * @memberof DatabaseManager
     */
    static _instance;
    
    /**
     * Return the instance of the DatabaseManager class
     * @returns {DatabaseManager}
     */
    static getInstance() {
        if (!DatabaseManager._instance) {
            DatabaseManager._instance = new DatabaseManager();
        }
        const self = DatabaseManager._instance;
        return self;
    }

    /**
     * Creates an instance of DatabaseManager.
     *
     * Please use {@link DatabaseManager.getInstance()} instead
     * @memberof DatabaseManager
     */
    constructor() {
    }

    /**
     * Locate customer session encryption key in the database
     * @param {number} customerId
     * @returns {Promise<import("../../mcos-gateway/src/encryption.js").SessionRecord>}
     */
    async fetchSessionKeyByCustomerId(
        customerId
    ) {

        const record = this.sessions.find(session => {
            return session.customer_id === customerId
        });
        if (typeof record === "undefined") {
            log.error("Unable to locate session key");
            throw new Error("Unable to fetch session key");
        }
        return record;
    }

    /**
     * Locate customer session encryption key in the database
     * @param {string} connectionId
     * @returns {Promise<import("../../mcos-gateway/src/encryption.js").SessionRecord>}
     */
    async fetchSessionKeyByConnectionId(
        connectionId
    ) {
        const record = await this.sessions.find(session => {
            return session.connection_id === connectionId
        });
        if (typeof record === "undefined") {
            throw new Error("Unable to fetch session key");
        }
        return record;
    }

    /**
     * Create or overwrite a customer's session key record
     * @param {number} customerId
     * @param {string} sessionkey
     * @param {string} contextId
     * @param {string} connectionId
     * @returns {Promise<void>}
     */
    async updateSessionKey(
        customerId,
        sessionkey,
        contextId,
        connectionId
    ) {
        const skey = sessionkey.slice(0, 16);

        /** @type {import("./models/Session.js").Session} */
        const updatedSession = {
            customer_id: customerId,
            sessionkey,
            skey,
            context_id: contextId,
            connection_id: connectionId
        }

        const record = await this.sessions.findIndex(session => {
            return session.customer_id === customerId
        });
        if (typeof record === "undefined") {
            throw new Error("Unable to fetch session key");
        }
        this.sessions.splice(record, 1, updatedSession)

        return;
    }
}
