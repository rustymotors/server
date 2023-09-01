
/**
 * This class abstracts database methods
 * @see {@link getDatabaseServer()} to get a singleton instance
 */

import { ConnectionRecord } from "../../interfaces/index.js";
import { DatabaseManager } from "../index.js";
import { Connection } from "../../shared/database.js";

export class Database implements DatabaseManager {

    static instance: DatabaseManager;

    /**
     * Return the singleton instance of the DatabaseManager class
     */
    static getInstance(): DatabaseManager {
        if (!Database.instance) {
            Database.instance = new Database();
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
        await Connection.sync();
        const record = await Connection.findOne(
            { where: { customerId } },
        );

        if (record === null) {
            const err = new Error(
                "Error fetching session key by customer id: not found",
            );
            throw err;
        }
        return JSON.parse(JSON.stringify(record));
    }

    /**
     * Locate customer session encryption key in the database
     */
    async fetchSessionKeyByConnectionId(
        connectionId: string,
    ): Promise<ConnectionRecord> {
        await Connection.sync();
        const record = await Connection.findOne(
            { where: { connectionId } },
        );
        
        if (record === null) {
            const err = new Error(
                "Error fetching session key by customer id: not found",
            );
            throw err;
        }
        return JSON.parse(JSON.stringify(record));
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
        await Connection.sync();
        Connection.upsert({
            customerId,
            connectionId,
            sessionKey,
            sKey,
            contextId
        });

    }
}
/**
 * Return the singleton instance of the DatabaseManager class
 */

export function getDatabaseServer(): DatabaseManager {
    return Database.getInstance();
}
