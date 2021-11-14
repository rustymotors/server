export type SessionRecord = {
    skey: string;
    sessionkey: string;
};
/**
 * @exports
 * @typedef {Object} SessionRecord
 * @property {string} skey
 * @property {string} sessionkey
 */
export class DatabaseManager {
    /**
     * @private
     * @type {DatabaseManager}
     */
    private static _instance;
    /**
     * @return {DatabaseManager}
     */
    static getInstance(): DatabaseManager;
    /**
     * @private
     * @type {import("../../config/src/index").AppConfiguration}
     */
    private _config;
    /**
     * @private
     * @type {import("http").Server}
     */
    private _server;
    /**
     * @private
     * @type {import("sqlite").Database | undefined}
     */
    private _localDB;
    closeDB(): Promise<void>;
    /**
     *
     * @param {import("../../config/src/index.js").AppConfiguration} config
     */
    init(config: import("../../config/src/index.js").AppConfiguration): Promise<DatabaseManager>;
    /**
     *
     * @param {import("http").IncomingMessage} request
     * @param {import("http").ServerResponse} response
     */
    handleRequest(request: import("http").IncomingMessage, response: import("http").ServerResponse): void;
    /**
     *
     * @param {number} customerId
     * @returns {Promise<SessionRecord>}
     */
    fetchSessionKeyByCustomerId(customerId: number): Promise<SessionRecord>;
    /**
     *
     * @param {string} connectionId
     * @returns {Promise<SessionRecord>}
     */
    fetchSessionKeyByConnectionId(connectionId: string): Promise<SessionRecord>;
    /**
     *
     * @param {number} customerId
     * @param {string} sessionkey
     * @param {string} contextId
     * @param {string} connectionId
     * @returns {Promise<number>}
     */
    _updateSessionKey(customerId: number, sessionkey: string, contextId: string, connectionId: string): Promise<number>;
    /**
     *
     * @returns {import("http").Server}
     */
    start(): import("http").Server;
}
