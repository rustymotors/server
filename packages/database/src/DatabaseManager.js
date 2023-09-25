/**
 * This class abstracts database methods
 * @see {@link getDatabaseServer()} to get a singleton instance
 */

import { getServerLogger } from "../../shared/log.js";

/**
 * @module Database
 */

export class Database {
    /**
     * @private
     * @type {import("../../interfaces/index.js").ConnectionRecord[]}
     */
    _sessions = [];
    /**
     * @private
     * @type {import("../../interfaces/index.js").RaceLobbyRecord[]}
     */
    _lobbies = [];
    /**
     * @type {Database}
     */
    static instance;

    /**
     * @private
     * @type {import("pino").Logger}
     */
    _log;

    /**
     * Creates an instance of Database.
     *
     * @param {import("pino").Logger} [log=getServerLogger({ module: "database" })]
     */
    constructor(
        log = getServerLogger({
            module: "database",
        }),
    ) {
        this._log = log;
    }

    /**
     * Return the singleton instance of the DatabaseManager class
     *
     * @static
     * @param {import("pino").Logger} log
     * @returns {Database}
     */
    static getInstance(log) {
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
    async fetchSessionKeyByCustomerId(customerId) {
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
    async fetchSessionKeyByConnectionId(connectionId) {
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
    async updateSessionKey(customerId, sessionKey, contextId, connectionId) {
        const sKey = sessionKey.slice(0, 16);

        /** @type {import("../../interfaces/index.js").ConnectionRecord} */
        const updatedSession = {
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
) {
    return Database.getInstance(option.log);
}
