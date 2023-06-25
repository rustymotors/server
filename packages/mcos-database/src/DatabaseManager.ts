import { Sentry } from "mcos/shared";
import { TLobby } from "./models/Lobby.js";
import {
    TSession,
    TDatabaseManager,
    TServerLogger,
    TSessionRecord,
} from "mcos/shared/interfaces";

/**
 * This class abstracts database methods
 * @see {@link getDatabaseServer()} for the database server
 * @class
 */

export class DatabaseManager {
    /** @type {TSession[]} */
    sessions: TSession[] = [];

    /** @type {TLobby[]} */
    lobbies: TLobby[] = [];

    /**
     *
     *
     * @private
     * @static
     * @type {TDatabaseManager}
     * @memberof DatabaseManager
     */
    static _instance: TDatabaseManager;

    /** @type {TServerLogger} */
    _log: TServerLogger;

    /**
     * Creates an instance of DatabaseManager.
     *
     * Please use {@link DatabaseManager.getInstance()} instead
     * @param {TServerLogger} log
     * @memberof DatabaseManager
     */
    constructor(log: TServerLogger) {
        this._log = log;
    }
    /**
     * Return the instance of the DatabaseManager class
     * @param {TServerLogger} log
     * @returns {TDatabaseManager}
     */
    static getInstance(log: TServerLogger): TDatabaseManager {
        if (!DatabaseManager._instance) {
            DatabaseManager._instance = new DatabaseManager(log);
        }
        const self = DatabaseManager._instance;
        return self;
    }

    /**
     * Locate customer session encryption key in the database
     * @param {number} customerId
     * @returns {Promise<TSessionRecord>}
     */
    async fetchSessionKeyByCustomerId(
        customerId: number
    ): Promise<TSessionRecord> {
        const record = this.sessions.find((session) => {
            return session.customerId === customerId;
        });
        if (typeof record === "undefined") {
            const err = new Error(
                "Error fetching session key by customer id: not found"
            );
            throw err;
        }
        return record;
    }

    /**
     * Locate customer session encryption key in the database
     * @param {string} connectionId
     * @returns {Promise<TSessionRecord>}
     */
    async fetchSessionKeyByConnectionId(
        connectionId: string
    ): Promise<TSessionRecord> {
        const record = this.sessions.find((session) => {
            return session.connectionId === connectionId;
        });
        if (typeof record === "undefined") {
            const err = new Error(
                "Error fetching session key by customer id: not found"
            );
            Sentry.addBreadcrumb({ level: "error", message: err.message });
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
    async updateSessionKey(
        customerId: number,
        sessionKey: string,
        contextId: string,
        connectionId: string
    ): Promise<void> {
        const sKey = sessionKey.slice(0, 16);

        /** @type {TSession} */
        const updatedSession: TSession = {
            customerId,
            sessionKey,
            sKey,
            contextId,
            connectionId,
        };

        const record = this.sessions.findIndex((session) => {
            return session.customerId === customerId;
        });
        if (typeof record === "undefined") {
            const err = new Error(
                "Error updating session key: existing key not found"
            );
            Sentry.addBreadcrumb({ level: "error", message: err.message });
            throw err;
        }
        this.sessions.splice(record, 1, updatedSession);
    }
}
/**
 * Return the instance of the DatabaseManager class
 * @param {TServerLogger} log
 * @returns {TDatabaseManager}
 */

export function getDatabaseServer(log: TServerLogger): TDatabaseManager {
    return DatabaseManager.getInstance(log);
}
