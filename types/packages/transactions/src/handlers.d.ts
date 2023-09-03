import { Logger } from "pino";
import { SocketWithConnectionInfo, MessageArrayWithConnectionInfo } from "../../interfaces/index.js";
import { MessageNode } from "../../shared/MessageNode.js";
declare function handleSetOptions(conn: SocketWithConnectionInfo, node: MessageNode, log: Logger): MessageArrayWithConnectionInfo;
/**
 *
 *
 * @param {SocketWithConnectionInfo} conn
 * @param {MessageNode} node
 * @param {Logger} log
 * @return {Promise<MessageArrayWithConnectionInfo>}
 * @memberof MCOTServer
 */
declare function handleClientConnect(conn: SocketWithConnectionInfo, node: MessageNode, log: Logger): Promise<MessageArrayWithConnectionInfo>;
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
//# sourceMappingURL=handlers.d.ts.map