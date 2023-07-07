import { TServiceResponse, TServiceRouterArgs } from "mcos/shared/interfaces";
/**
 * Entry and exit point for the lobby service
 *
 * @export
 * @param {TBufferWithConnection} dataConnection
 * @param {TServerConfiguration} config
 * @param {TServerLogger} log
 * @return {Promise<TServiceResponse>}
 */
export declare function receiveTransactionsData(args: TServiceRouterArgs): Promise<TServiceResponse>;
