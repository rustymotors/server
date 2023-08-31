import { SocketWithConnectionInfo, WebJSONResponse } from "../../interfaces/index.js";
export declare function replacerFunc(): (_key: string, value: unknown) => unknown;
/**
 *
 * @param {TSocketWithConnectionInfo[]} connections
 * @returns {{
    code: number,
    headers: OutgoingHttpHeaders | OutgoingHttpHeader[] | undefined,
    body: string
}}
 */
export declare function resetQueue(connections: SocketWithConnectionInfo[]): WebJSONResponse;
//# sourceMappingURL=resetQueue.d.ts.map