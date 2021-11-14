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
    static _instance: any;
    /**
     *
     * @returns {Promise<LoginServer>}
     */
    static getInstance(): Promise<LoginServer>;
    /** @type {DatabaseManager} */
    databaseManager: DatabaseManager;
    /**
     *
     * @param {import("../../transactions/src/types").UnprocessedPacket} rawPacket
     * @return {Promise<import("../../core/src/tcpConnection").TCPConnection>}
     */
    dataHandler(rawPacket: import("../../transactions/src/types").UnprocessedPacket): Promise<import("../../core/src/tcpConnection").TCPConnection>;
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
     * @return {Promise<Buffer>}
     */
    _userLogin(connection: import("../../core/src/tcpConnection").TCPConnection, data: Buffer): Promise<Buffer>;
}
import { DatabaseManager } from "../../database/src/index.js";
import { Buffer } from "buffer";
