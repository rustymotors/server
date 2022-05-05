/**
 * @readonly
 */
export const messageHandlers: ({
    name: string;
    handler: typeof handleSetOptions;
} | {
    name: string;
    handler: typeof handleClientConnect;
})[];
/**
 *
 *
 * @param {import('mcos-shared/types').SocketWithConnectionInfo} conn
 * @param {MessageNode} node
 * @return {import('mcos-shared/types').TSMessageArrayWithConnection}
 * @memberof MCOTServer
 */
declare function handleSetOptions(conn: import('mcos-shared/types').SocketWithConnectionInfo, node: MessageNode): import('mcos-shared/types').TSMessageArrayWithConnection;
/**
  *
  *
  * @param {import('mcos-shared/types').SocketWithConnectionInfo} conn
  * @param {MessageNode} node
  * @return {Promise<import('mcos-shared/types').TSMessageArrayWithConnection>}
  * @memberof MCOTServer
  */
declare function handleClientConnect(conn: import('mcos-shared/types').SocketWithConnectionInfo, node: MessageNode): Promise<import('mcos-shared/types').TSMessageArrayWithConnection>;
import { MessageNode } from "mcos-shared/types";
export {};
//# sourceMappingURL=handlers.d.ts.map