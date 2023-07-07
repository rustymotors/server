import { TSocketWithConnectionInfo, TJSONResponse } from "mcos/shared/interfaces";
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
export declare function resetQueue(connections: TSocketWithConnectionInfo[]): TJSONResponse;
