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

import { logger } from "mcos-logger/src/index.js";
import { Session, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const log = logger.child({ service: "mcoserver:DatabaseMgr" });

/**
 * This class abstracts database methods
 * @class
 */
export class DatabaseManager {
    localDB: PrismaClient = prisma;
    /**
     *
     *
     * @private
     * @static
     * @type {DatabaseManager}
     * @memberof DatabaseManager
     */
    static _instance: DatabaseManager;

    /**
     * Return the instance of the DatabaseManager class
     * @returns {DatabaseManager}
     */
    static getInstance(): DatabaseManager {
        if (typeof DatabaseManager._instance === "undefined") {
            DatabaseManager._instance = new DatabaseManager();
        }
        const self = DatabaseManager._instance;
        return self;
    }

    /**
     * Initialize database and set up schemas if needed
     * @returns {Promise<void>}
     */

    /**
     * Locate customer session encryption key in the database
     * @param {number} customerId
     * @returns {<Promise<Session>}
     */
    async fetchSessionKeyByCustomerId(customerId: number): Promise<Session> {
        const record = await this.localDB.session.findUnique({
            where: {
                customerId: customerId,
            },
        });
        if (record === null) {
            log.debug("Unable to locate session key");
            throw new Error("Unable to fetch session key");
        }
        return record;
    }

    /**
     * Locate customer session encryption key in the database
     * @param {string} connectionId
     * @returns {Promise<Session>}
     */
    async fetchSessionKeyByConnectionId(
        connectionId: string
    ): Promise<Session> {
        const record = await this.localDB.session.findFirst({
            where: {
                connectionId: connectionId,
            },
        });
        if (record === null) {
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
     * @returns {Promise<number>}
     */
    async updateSessionKey(
        customerId: number,
        sessionkey: string,
        contextId: string,
        connectionId: string
    ): Promise<Session> {
        const skey = sessionkey.slice(0, 16);

        const record = await this.localDB.session.upsert({
            where: {
                customerId: customerId,
            },
            update: {
                sessionKey: sessionkey,
                sKey: skey,
            },
            create: {
                customerId: customerId,
                sessionKey: sessionkey,
                sKey: skey,
                contextId: contextId,
                connectionId: connectionId,
            },
        });
        return record;
    }
}
