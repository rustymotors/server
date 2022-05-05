/**
 * Entry and exit point of the Login service
 *
 * @export
 * @param {import('mcos-shared/types').BufferWithConnection} dataConnection
 * @return {Promise<import('mcos-shared/types').GServiceResponse>}
 */
export function receiveLoginData(dataConnection: import('mcos-shared/types').BufferWithConnection): Promise<import('mcos-shared/types').GServiceResponse>;
/**
 * Manages the initial game connection setup and teardown.
 * @module LoginServer
 */
/**
 * Please use {@link LoginServer.getInstance()}
 * @classdesc
 * @property {DatabaseManager} databaseManager
 */
export class LoginServer {
    /**
     *
     *
     * @static
     * @type {LoginServer}
     * @memberof LoginServer
     */
    static _instance: LoginServer;
    /**
     * Get the single instance of the login server
     *
     * @static
     * @return {LoginServer}
     * @memberof LoginServer
     */
    static getInstance(): LoginServer;
    databaseManager: DatabaseManager;
    /**
     *
     * @param {{connection: import("mcos-shared").TCPConnection, data: Buffer}} rawPacket
     * @return {Promise<import("mcos-shared").TCPConnection>}
     */
    dataHandler(rawPacket: {
        connection: import("mcos-shared").TCPConnection;
        data: Buffer;
    }): Promise<import("mcos-shared").TCPConnection>;
    /**
     *
     * @private
     * @param {string} contextId
     * @return {import("mcos-shared/types").UserRecordMini}
     */
    private _npsGetCustomerIdByContextId;
    /**
     * Process a UserLogin packet
     * Should return a {@link NPSMessage} object
     * @private
     * @param {import("mcos-shared").TCPConnection} connection
     * @param {Buffer} data
     * @return {Promise<Buffer>}
     */
    private _userLogin;
}
import { DatabaseManager } from "mcos-database";
//# sourceMappingURL=index.d.ts.map