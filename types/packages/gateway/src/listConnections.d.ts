/**
 *
 * @param {TSocketWithConnectionInfo[]} connections
 * @returns {{
    code: number;
    headers: OutgoingHttpHeaders | OutgoingHttpHeader[] | undefined;
    body: string;
}}
 */
import { SocketWithConnectionInfo, WebJSONResponse } from "../../interfaces/index.js";
export declare function listConnections(connections: SocketWithConnectionInfo[]): WebJSONResponse;
//# sourceMappingURL=listConnections.d.ts.map