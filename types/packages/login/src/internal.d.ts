import { Logger } from "pino";
import { TBufferWithConnection, MessageArrayWithConnectionInfo, ServiceArgs } from "../../interfaces/index.js";
import { Configuration } from "../../shared/Configuration.js";
/**
 * Process a UserLogin packet
 * @private
 * @param {TBufferWithConnection} dataConnection
 * @param {ServerConfiguration} config
 * @param {Logger} log
 * @return {Promise<MessageArrayWithConnectionInfo>}
 */
declare function login(dataConnection: TBufferWithConnection, config: Configuration, log: Logger): Promise<MessageArrayWithConnectionInfo>;
export declare const messageHandlers: {
    id: string;
    handler: typeof login;
}[];
/**
 *
 *
 * @param {TBufferWithConnection} dataConnection
 * @param {ServerConfiguration} config
 * @param {Logger} log
 * @return {Promise<MessageArrayWithConnectionInfo>}
 */
export declare function handleData(args: ServiceArgs): Promise<MessageArrayWithConnectionInfo>;
export {};
//# sourceMappingURL=internal.d.ts.map