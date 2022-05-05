/**
 * This class abstracts database methods
 * @class
 */
export class DatabaseManager {
    /**
     *
     *
     * @private
     * @static
     * @type {DatabaseManager}
     * @memberof DatabaseManager
     */
    private static _instance;
    /**
     * Return the instance of the DatabaseManager class
     * @returns {DatabaseManager}
     */
    static getInstance(): DatabaseManager;
    /**
     * Initialize database and set up schemas if needed
     * @returns {Promise<void>}
     */
    init(): Promise<void>;
    connectionURI: string;
    /** @type {pg.Client | undefined} */
    localDB: pg.Client | undefined;
    /**
     * Locate customer session encryption key in the database
     * @param {number} customerId
     * @returns {Promise<import("mcos-shared/types").SessionRecord>}
     */
    fetchSessionKeyByCustomerId(customerId: number): Promise<import("mcos-shared/types").SessionRecord>;
    /**
     * Locate customer session encryption key in the database
     * @param {number} connectionId
     * @returns {Promise<import("mcos-shared/types").SessionRecord>}
     */
    fetchSessionKeyByConnectionId(connectionId: number): Promise<import("mcos-shared/types").SessionRecord>;
    /**
     * Create or overwrite a customer's session key record
     * @param {number} customerId
     * @param {string} sessionkey
     * @param {string} contextId
     * @param {string} connectionId
     * @returns {Promise<number>}
     */
    updateSessionKey(customerId: number, sessionkey: string, contextId: string, connectionId: string): Promise<number>;
}
import pg from "pg";
//# sourceMappingURL=index.d.ts.map