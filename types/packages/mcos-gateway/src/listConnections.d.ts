import { TJSONResponse, TSocketWithConnectionInfo } from "mcos/shared/interfaces";
/**
 *
 * @param {TSocketWithConnectionInfo[]} connections
 * @returns {{
    code: number;
    headers: OutgoingHttpHeaders | OutgoingHttpHeader[] | undefined;
    body: string;
}}
 */
export declare function listConnections(connections: TSocketWithConnectionInfo[]): TJSONResponse;
