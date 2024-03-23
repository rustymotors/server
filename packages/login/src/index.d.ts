import type { ServerLogger, ServiceResponse, NPSMessage } from "../../shared";
/**
 * Please use {@link LoginServer.getInstance()}
 */
export declare class LoginServer {
    _log: any;
    static _instance: LoginServer | undefined;
    /**
     * Please use {@see LoginServer.getInstance} instead
     * @param {object} options
     * @param {ServerLogger} options.log
     * @memberof LoginServer
     */
    constructor({ log }: { log: ServerLogger });
    /**
     * Get the single instance of the login server
     *
     * @static
     * @param {ServerLogger} log
     * @return {LoginServer}
     */
    static getInstance(log: ServerLogger): LoginServer;
    /**
     *
     * @param {string} contextId
     * @return {import("../../interfaces/index.js").UserRecordMini}
     */
    _npsGetCustomerIdByContextId(
        contextId: string,
    ): import("../../interfaces/index.js").UserRecordMini;
}
/**
 * Entry and exit point of the Login service
 *
 * @export
 * @param {object} args
 * @param {string} args.connectionId
 * @param {NPSMessage} args.message
 * @param {ServerLogger} args.log
 *
 * @return {Promise<ServiceResponse>}
 */
export declare function receiveLoginData({
    connectionId,
    message,
    log,
}: {
    connectionId: string;
    message: NPSMessage;
    log: ServerLogger;
}): Promise<ServiceResponse>;
