/**
 * This class abstracts database methods
 * @see {@link getDatabaseServer()} to get a singleton instance
 */

import { getServerLogger } from "../../shared/log.js";
import { ConnectionRecord, RaceLobbyRecord } from "../../interfaces/index.js";

/**
 * @module Database
 */

export class Database {
    static instance: Database | undefined;
    private _log: import("pino").Logger;
    private _sessions: ConnectionRecord[];
    private _lobbies: RaceLobbyRecord[][];

    /**
     * Creates an instance of Database.
     *
     * @param {import("pino").Logger} [log=getServerLogger({ module: "database" })]
     */
    constructor(
        log: import("pino").Logger = getServerLogger({
            module: "database",
        }),
    ) {
        this._log = log;
        this._sessions = [];
        /**
         * @private
         * @type {import("../../interfaces/index.js").RaceLobbyRecord[]}
         */
        this._lobbies = [];
    }

    /**
     * Return the singleton instance of the DatabaseManager class
     *
     * @static
     * @param {import("pino").Logger} log
     * @returns {Database}
     */
    static getInstance(log: import("pino").Logger): Database {
        if (!Database.instance) {
            Database.instance = new Database(log);
        }
        const self = Database.instance;
        return self;
    }

    /**
     * Locate customer session encryption key in the database
     *
     * @param {number} customerId
     * @returns {Promise<import("../../interfaces/index.js").ConnectionRecord>}
     * @throws {Error} If the session key is not found
     */
    async fetchSessionKeyByCustomerId(
        customerId: number,
    ): Promise<import("../../interfaces/index.js").ConnectionRecord> {
        const record = this._sessions.find((session) => {
            return session.customerId === customerId;
        });
        if (typeof record === "undefined") {
            const err = new Error(
                "Error fetching session key by customer id: not found",
            );
            throw err;
        }
        return record;
    }

    /**
     * Locate customer session encryption key in the database
     *
     * @param {string} connectionId
     * @returns {Promise<import("../../interfaces/index.js").ConnectionRecord>}
     * @throws {Error} If the session key is not found
     */
    async fetchSessionKeyByConnectionId(
        connectionId: string,
    ): Promise<import("../../interfaces/index.js").ConnectionRecord> {
        const record = this._sessions.find((session) => {
            return session.connectionId === connectionId;
        });
        if (typeof record === "undefined") {
            const err = new Error(
                "Error fetching session key by customer id: not found",
            );
            throw err;
        }
        return record;
    }

    /**
     * Create or overwrite a customer's session key record
     *
     * @param {number} customerId
     * @param {string} sessionKey
     * @param {string} contextId
     * @param {string} connectionId
     * @returns {Promise<void>}
     * @throws {Error} If the session key is not found
     */
    async updateSessionKey(
        customerId: number,
        sessionKey: string,
        contextId: string,
        connectionId: string,
    ): Promise<void> {
        const sKey = sessionKey.slice(0, 16);

        const updatedSession: import("../../interfaces/index.js").ConnectionRecord =
            {
                customerId,
                sessionKey,
                sKey,
                contextId,
                connectionId,
            };

        const record = this._sessions.findIndex((session) => {
            return session.customerId === customerId;
        });
        if (typeof record === "undefined") {
            const err = new Error(
                "Error updating session key: existing key not found",
            );
            throw err;
        }
        this._sessions.splice(record, 1, updatedSession);
    }
}

/**
 * Return the singleton instance of the DatabaseManager class
 *
 * @param {object} options
 * @param {import("pino").Logger} options.log=getServerLogger({ module: "database" })
 * @returns {Database}
 */

export function getDatabaseServer(
    option = {
        log: getServerLogger({
            module: "database",
        }),
    },
): Database {
    if (!Database.instance) {
        Database.instance = new Database(option.log);
    }
    return Database.getInstance(option.log);
}
