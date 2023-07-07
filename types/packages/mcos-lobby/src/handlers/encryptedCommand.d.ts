import { TServiceResponse, TServiceRouterArgs } from "mcos/shared/interfaces";
/**
 *
 *
 * @param {TBufferWithConnection} dataConnection
 * @param {TServerLogger} log
 * @return {Promise<TMessageArrayWithConnection>}
 */
export declare function handleEncryptedNPSCommand(args: TServiceRouterArgs): Promise<TServiceResponse>;
