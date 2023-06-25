import {
    TConnection,
    TJSONResponse,
    TSocketWithConnectionInfo,
} from "mcos/shared/interfaces";
/**
 *
 * @param {TSocketWithConnectionInfo[]} connections
 * @returns {{
    code: number;
    headers: OutgoingHttpHeaders | OutgoingHttpHeader[] | undefined;
    body: string;
}}
 */

export function listConnections(
    connections: TSocketWithConnectionInfo[]
): TJSONResponse {
    /**
     * @type {}
     */
    let response: Partial<TConnection>[] = [];
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
