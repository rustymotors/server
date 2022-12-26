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

import { Session } from "./models/Session.js";
import { Lobby } from "./models/Lobby.js";
import pg from "pg";
const Client = pg.Client;
import createDebug from 'debug'
import { createLogger } from 'bunyan'

const appName = 'mcos'

const debug = createDebug(appName)
const log = createLogger({ name: appName })


/**
 * This class abstracts database methods
 * @class
 */
export class DatabaseManager {
    /** @type {pg.Client | undefined} */
    localDB = undefined;
    /**
     *
     *
     * @private
     * @static
     * @type {DatabaseManager}
     * @memberof DatabaseManager
     */
    static _instance;
    /** @type {string} */
    connectionURI;

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
     * Initialize database and set up schemas if needed
     */
    async init() {
        if (typeof this.localDB === "undefined") {
            debug("Initializing the database...");

            try {
                const self = DatabaseManager._instance;

                const db = new Client({
                    connectionString: process.env["CONNECTION_URL"],
                });

                await db.connect();

                self.localDB = db;

                await db.query(Session.schema);

                await db.query(Lobby.schema);
                debug("Database initialized");
            } catch (/** @type {unknown} */ err) {
                if (err instanceof Error) {
                    const newError = new Error(
                        `There was an error setting up the database: ${err.message}`
                    );
                    log.error(newError.message);
                    throw newError;
                }
                throw err;
            }
        }
    }

    /**
     * Creates an instance of DatabaseManager.
     *
     * Please use {@link DatabaseManager.getInstance()} instead
     * @memberof DatabaseManager
     */
    constructor() {
        if (!process.env["CONNECTION_URL"]) {
            throw new Error("Please set CONNECTION_URL");
        }
        this.connectionURI = process.env["CONNECTION_URL"];
    }

    /**
     * Locate customer session encryption key in the database
     * @param {number} customerId
     * @returns {Promise<import("../../mcos-gateway/src/encryption.js").SessionRecord>}
     */
    async fetchSessionKeyByCustomerId(
        customerId
    ) {
        await this.init();
        if (typeof this.localDB === "undefined") {
            log.warn("Database not ready in fetchSessionKeyByCustomerId()");
            throw new Error(
                "Error accessing database. Are you using the instance?"
            );
        }
        const record = await this.localDB.query(
            "SELECT sessionkey, skey FROM sessions WHERE customer_id = $1",
            [customerId]
        );
        if (typeof record === "undefined") {
            debug("Unable to locate session key");
            throw new Error("Unable to fetch session key");
        }
        return record.rows[0];
    }

    /**
     * Locate customer session encryption key in the database
     * @param {number} connectionId
     * @returns {Promise<import("../../mcos-gateway/src/encryption.js").SessionRecord>}
     */
    async fetchSessionKeyByConnectionId(
        connectionId
    ) {
        await this.init();
        if (typeof this.localDB === "undefined") {
            log.warn("Database not ready in fetchSessionKeyByConnectionId()");
            throw new Error(
                "Error accessing database. Are you using the instance?"
            );
        }
        const record = await this.localDB.query(
            "SELECT sessionkey, skey FROM sessions WHERE connection_id = $1",
            [connectionId]
        );
        if (typeof record === "undefined") {
            throw new Error("Unable to fetch session key");
        }
        return record.rows[0];
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
        customerId,
        sessionkey,
        contextId,
        connectionId
    ) {
        await this.init();
        const skey = sessionkey.slice(0, 16);

        if (typeof this.localDB === "undefined") {
            log.warn("Database not ready in updateSessionKey()");
            throw new Error(
                "Error accessing database. Are you using the instance?"
            );
        }
        const record = await this.localDB.query(
            `INSERT INTO sessions (customer_id, sessionkey, skey, context_id, connection_id)
        VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (customer_id)
        DO UPDATE SET sessionkey = $2, skey = $3;`,
            [customerId, sessionkey, skey, contextId, connectionId]
        );
        if (typeof record === "undefined") {
            throw new Error("Unable to fetch session key");
        }
        return 1;
    }
}
