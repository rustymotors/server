import { TServerLogger, IDatabaseManager, TUserRecordMini, TServiceResponse, TServiceRouterArgs } from "mcos/shared/interfaces";
/**
 * Please use {@link LoginServer.getInstance()}
 * @classdesc
 * @property {DatabaseManager} databaseManager
 */
export declare class LoginServer {
    #private;
    /**
     *
     *
     * @static
     * @type {LoginServer}
     * @memberof LoginServer
     */
    static _instance: LoginServer;
    /** @type {TServerLogger} */
    private readonly _log;
    /**
     * Please use getInstance() instead
     * @author Drazi Crendraven
     * @param {TDatabaseManager} database
     * @param {TServerLogger} log
     * @memberof LoginServer
     */
    constructor(database: IDatabaseManager, log: TServerLogger);
    /**
     * Get the single instance of the login server
     *
     * @static
     * @param {TDatabaseManager} database
     * @param {TServerLogger} log
     * @return {LoginServer}
     * @memberof LoginServer
     */
    static getInstance(database: IDatabaseManager, log: TServerLogger): LoginServer;
    /**
     *
     * @private
     * @param {string} contextId
     * @return {UserRecordMini}
     */
    _npsGetCustomerIdByContextId(contextId: string): TUserRecordMini;
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
export declare function receiveLoginData(args: TServiceRouterArgs): Promise<TServiceResponse>;
