import { TSession, IDatabaseManager, TServerLogger, TSessionRecord, TLobby } from "mcos/shared/interfaces";
/**
 * This class abstracts database methods
 * @see {@link getDatabaseServer()} to get a singleton instance
 */
export declare class DatabaseManager implements IDatabaseManager {
    sessions: TSession[];
    lobbies: TLobby[];
    static _instance: IDatabaseManager;
    _log: TServerLogger;
    constructor(log: TServerLogger);
    /**
     * Return the singleton instance of the DatabaseManager class
     */
    static getInstance(log: TServerLogger): IDatabaseManager;
    /**
     * Locate customer session encryption key in the database
     */
    fetchSessionKeyByCustomerId(customerId: number): Promise<TSessionRecord>;
    /**
     * Locate customer session encryption key in the database
     */
    fetchSessionKeyByConnectionId(connectionId: string): Promise<TSessionRecord>;
    /**
     * Create or overwrite a customer's session key record
     */
    updateSessionKey(customerId: number, sessionKey: string, contextId: string, connectionId: string): Promise<void>;
}
/**
 * Return the singleton instance of the DatabaseManager class
 */
export declare function getDatabaseServer(log: TServerLogger): IDatabaseManager;
