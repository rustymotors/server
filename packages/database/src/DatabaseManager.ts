
/**
 * This class abstracts database methods
 * @see {@link getDatabaseServer()} to get a singleton instance
 */

import { Logger } from "pino";
import { ConnectionRecord, RaceLobbyRecord, } from "../../interfaces/index.js";
import { DatabaseManager } from "../index.js";

export class Database implements DatabaseManager {
    private sessions: ConnectionRecord[] = [];

    private lobbies: RaceLobbyRecord[] = [];

    static instance: DatabaseManager;

    private log: Logger;

    constructor(log: Logger) {
        this.log = log;
    }
    /**
     * Return the singleton instance of the DatabaseManager class
     */
    static getInstance(log: Logger): DatabaseManager {
        if (!Database.instance) {
            Database.instance = new Database(log);
        }
        const self = Database.instance;
        return self;
    }

    /**
     * Locate customer session encryption key in the database
     */
    async fetchSessionKeyByCustomerId(
        customerId: number,
    ): Promise<ConnectionRecord> {
        const record = this.sessions.find((session) => {
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
     */
    async fetchSessionKeyByConnectionId(
        connectionId: string,
    ): Promise<ConnectionRecord> {
        const record = this.sessions.find((session) => {
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
     */
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

        const record = this.sessions.findIndex((session) => {
            return session.customerId === customerId;
        });
        if (typeof record === "undefined") {
            const err = new Error(
                "Error updating session key: existing key not found",
            );
            throw err;
        }
        this.sessions.splice(record, 1, updatedSession);
    }
}
/**
 * Return the singleton instance of the DatabaseManager class
 */

export function getDatabaseServer(log: Logger): DatabaseManager {
    return Database.getInstance(log);
}
