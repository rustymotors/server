import { Sentry } from "mcos/shared";
import {
    TSession,
    TDatabaseManager,
    TServerLogger,
    TSessionRecord,
    TLobby,
} from "mcos/shared/interfaces";

/**
 * This class abstracts database methods
 * @see {@link getDatabaseServer()} to get a singleton instance
 */

export class DatabaseManager {
    sessions: TSession[] = [];

    lobbies: TLobby[] = [];

    static _instance: TDatabaseManager;

    _log: TServerLogger;

    constructor(log: TServerLogger) {
        this._log = log;
    }
    /**
     * Return the singleton instance of the DatabaseManager class
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
     */
    async updateSessionKey(
        customerId: number,
        sessionKey: string,
        contextId: string,
        connectionId: string
    ): Promise<void> {
        const sKey = sessionKey.slice(0, 16);

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
            throw err;
        }
        this.sessions.splice(record, 1, updatedSession);
    }
}
/**
 * Return the singleton instance of the DatabaseManager class
 */

export function getDatabaseServer(log: TServerLogger): TDatabaseManager {
    return DatabaseManager.getInstance(log);
}
