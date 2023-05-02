export type TConnection = {
    id: string;
    remoteAddress: string;
    inQueue: boolean;
};
/**
 *
 * @param {TSocketWithConnectionInfo[]} connections
 * @returns {{
    code: number;
    headers: OutgoingHttpHeaders | OutgoingHttpHeader[] | undefined;
    body: string;
}}
 */

import { TSocketWithConnectionInfo } from "mcos/shared";
import { TJSONResponse } from "./adminServer";

export function listConnections(connections: TSocketWithConnectionInfo[]): TJSONResponse {

    /**
     * @type {}
     */
    let response: TConnection[] = [];
    connections.forEach((connection) => {
        response.push({
            id: connection.id,
            remoteAddress: `${connection.socket.remoteAddress}:${connection.localPort}`,
            inQueue: connection.inQueue,
        });
    });

    return {
        code: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response),
    };
}
