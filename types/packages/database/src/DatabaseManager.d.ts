/**
 * This class abstracts database methods
 * @see {@link getDatabaseServer()} to get a singleton instance
 */
import { Logger } from "pino";
import { ConnectionRecord } from "../../interfaces/index.js";
import { DatabaseManager } from "../index.js";
export declare class Database implements DatabaseManager {
    private sessions;
    private lobbies;
    static instance: DatabaseManager;
    private log;
    constructor(log: Logger);
    /**
     * Return the singleton instance of the DatabaseManager class
     */
    static getInstance(log: Logger): DatabaseManager;
    /**
     * Locate customer session encryption key in the database
     */
    fetchSessionKeyByCustomerId(customerId: number): Promise<ConnectionRecord>;
    /**
     * Locate customer session encryption key in the database
     */
    fetchSessionKeyByConnectionId(connectionId: string): Promise<ConnectionRecord>;
    /**
     * Create or overwrite a customer's session key record
     */
    updateSessionKey(customerId: number, sessionKey: string, contextId: string, connectionId: string): Promise<void>;
}
/**
 * Return the singleton instance of the DatabaseManager class
 */
export declare function getDatabaseServer(log: Logger): DatabaseManager;
//# sourceMappingURL=DatabaseManager.d.ts.map