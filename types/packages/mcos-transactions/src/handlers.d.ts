import { MessageNode } from "mcos/shared";
import { TMessageArrayWithConnection, TServerLogger, TSocketWithConnectionInfo } from "mcos/shared/interfaces";
/**
 *
 * @param {TSocketWithConnectionInfo} conn
 * @param {MessageNode} node
 * @param {TServerLogger} log
 * @return {TMessageArrayWithConnection}
 * @memberof MCOTServer
 */
declare function handleSetOptions(conn: TSocketWithConnectionInfo, node: MessageNode, log: TServerLogger): TMessageArrayWithConnection;
/**
 *
 *
 * @param {TSocketWithConnectionInfo} conn
 * @param {MessageNode} node
 * @param {TServerLogger} log
 * @return {Promise<TMessageArrayWithConnection>}
 * @memberof MCOTServer
 */
declare function handleClientConnect(conn: TSocketWithConnectionInfo, node: MessageNode, log: TServerLogger): Promise<TMessageArrayWithConnection>;
/**
 * @readonly
 */
export declare const messageHandlers: ({
    name: string;
    handler: typeof handleSetOptions;
} | {
    name: string;
    handler: typeof handleClientConnect;
})[];
export {};
