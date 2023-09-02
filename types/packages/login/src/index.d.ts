import { Logger, DatabaseManager, UserRecordMini, ServiceArgs, ServiceResponse } from "../../interfaces/index.js";
/**
 * Please use {@link LoginServer.getInstance()}
 * @classdesc
 * @property {DatabaseManager} databaseManager
 */
export declare class LoginServer {
    /**
     *
     *
     * @static
     * @type {LoginServer}
     * @memberof LoginServer
     */
    static _instance: LoginServer;
    private databaseManager;
    /** @type {TServerLogger} */
    private readonly _log;
    /**
     * Please use getInstance() instead
     * @author Drazi Crendraven
     * @param {TDatabaseManager} database
     * @param {TServerLogger} log
     * @memberof LoginServer
     */
    constructor(database: DatabaseManager, log: Logger);
    /**
     * Get the single instance of the login server
     *
     * @static
     * @param {TDatabaseManager} database
     * @param {TServerLogger} log
     * @return {LoginServer}
     * @memberof LoginServer
     */
    static getInstance(database: DatabaseManager, log: Logger): LoginServer;
    /**
     *
     * @private
     * @param {string} contextId
     * @return {UserRecordMini}
     */
    _npsGetCustomerIdByContextId(contextId: string): UserRecordMini;
}
/**
 * Entry and exit point of the Login service
 *
 * @export
 * @param {TBufferWithConnection} dataConnection
 * @param {TServerConfiguration} config
 * @param {TServerLogger} log
 * @return {Promise<TServiceResponse>}
 */
export declare function receiveLoginData(args: ServiceArgs): Promise<ServiceResponse>;
//# sourceMappingURL=index.d.ts.map