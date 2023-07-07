import { TBufferWithConnection, TConfiguration, TServerLogger, TMessageArrayWithConnection, TServiceRouterArgs } from "mcos/shared/interfaces";
/**
 * Process a UserLogin packet
 * @private
 * @param {TBufferWithConnection} dataConnection
 * @param {TConfiguration} config
 * @param {TServerLogger} log
 * @return {Promise<TMessageArrayWithConnection>}
 */
declare function login(dataConnection: TBufferWithConnection, config: TConfiguration, log: TServerLogger): Promise<TMessageArrayWithConnection>;
export declare const messageHandlers: {
    id: string;
    handler: typeof login;
}[];
/**
 *
 *
 * @param {TBufferWithConnection} dataConnection
 * @param {TConfiguration} config
 * @param {TServerLogger} log
 * @return {Promise<TMessageArrayWithConnection>}
 */
export declare function handleData(args: TServiceRouterArgs): Promise<TMessageArrayWithConnection>;
export {};
