/// <reference types="node" />
import { DatabaseManager } from "../../database/src/index";
import { UnprocessedPacket, ITCPConnection, UserRecordMini } from "../../types/src/index";
/**
 * Manages the initial game connection setup and teardown.
 * @module LoginServer
 */
/**
 * @class
 * @property {DatabaseManager} databaseManager
 */
export declare class LoginServer {
    static _instance: LoginServer;
    databaseManager: DatabaseManager;
    static getInstance(): LoginServer;
    private constructor();
    /**
     *
     * @param {IRawPacket} rawPacket
     * @param {IServerConfig} config
     * @return {Promise<ConnectionObj>}
     */
    dataHandler(rawPacket: UnprocessedPacket): Promise<ITCPConnection>;
    /**
     *
     * @param {string} contextId
     * @return {Promise<IUserRecordMini>}
     */
    _npsGetCustomerIdByContextId(contextId: string): Promise<UserRecordMini>;
    /**
     * Process a UserLogin packet
     * Should return a @link {module:NPSMsg} object
     * @param {ConnectionObj} connection
     * @param {Buffer} data
     * @param {IServerConfig} config
     * @return {Promise<Buffer>}
     */
    _userLogin(connection: ITCPConnection, data: Buffer): Promise<Buffer>;
}
