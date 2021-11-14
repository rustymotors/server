/// <reference types="node" />
export type UserRecordMini = {
    contextId: string;
    customerId: number;
    userId: number;
};
/**
 * Manages the initial game connection setup and teardown.
 * @module LoginServer
 */
/**
 * @exports
 * @typedef {Object} UserRecordMini
 * @property {string} contextId
 * @property {number} customerId
 * @property {number} userId
 */
/**
 * @class
 * @property {LoginServer} _instance
 * @property {DatabaseManager} databaseManager
 */
export class LoginServer {
    /**
     * @private
     * @type {LoginServer}
     */
    private static _instance;
    /**
     *
     * @returns {LoginServer}
     */
    static getInstance(): LoginServer;
    /**
     *
     * @param {import("../../transactions/src/types").UnprocessedPacket} rawPacket
     * @param {import("../../database/src/index").DatabaseManager} databaseManager
     * @return {Promise<import("../../core/src/tcpConnection").TCPConnection>}
     */
    dataHandler(rawPacket: import("../../transactions/src/types").UnprocessedPacket, databaseManager: import("../../database/src/index").DatabaseManager): Promise<import("../../core/src/tcpConnection").TCPConnection>;
    /**
     *
     * @param {string} contextId
     * @return {Promise<UserRecordMini>}
     */
    _npsGetCustomerIdByContextId(contextId: string): Promise<UserRecordMini>;
    /**
     * Process a UserLogin packet
     * Should return a @link {NPSMessage} object
     * @param {import("../../core/src/tcpConnection").TCPConnection} connection
     * @param {Buffer} data
     * @param {import("../../database/src/index").DatabaseManager} databaseManager
     * @return {Promise<Buffer>}
     */
    _userLogin(connection: import("../../core/src/tcpConnection").TCPConnection, data: Buffer, databaseManager: import("../../database/src/index").DatabaseManager): Promise<Buffer>;
}
import { Buffer } from "buffer";
