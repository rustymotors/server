/**
 *
 * @param {TSocketWithConnectionInfo[]} connections
 * @param {string} connectionId
 * @returns {TJSONResponse}
 */
import { TJSONResponse, TSocketWithConnectionInfo } from "mcos/shared/interfaces";
export declare function releaseQueue(connections: TSocketWithConnectionInfo[], connectionId: string): TJSONResponse;
