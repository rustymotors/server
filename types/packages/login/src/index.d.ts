/// <reference types="node" />
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
     * @returns {LoginServer}
     */
    static getInstance(): LoginServer;
    databaseManager: DatabaseManager;
    /**
     *
     * @param {UnprocessedPacket} rawPacket
     * @param {import("../../config/src/index").AppConfiguration} config
     * @return {Promise<TCPConnection>}
     */
    dataHandler(rawPacket: any): Promise<any>;
    /**
     *
     * @param {string} contextId
     * @return {Promise<UserRecordMini>}
     */
    _npsGetCustomerIdByContextId(contextId: string): Promise<UserRecordMini>;
    /**
     * Process a UserLogin packet
     * Should return a @link {NPSMessage} object
     * @param {TCPConnection} connection
     * @param {Buffer} data
     * @return {Promise<Buffer>}
     */
    _userLogin(connection: any, data: Buffer): Promise<Buffer>;
}
export type UserRecordMini = {
    contextId: string;
    customerId: number;
    userId: number;
};
import { DatabaseManager } from "../../database/src/index";
import { Buffer } from "buffer";
