import {
    TConnection,
    WebJSONResponse,
    SocketWithConnectionInfo,
} from "@mcos/interfaces";
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
    connections: SocketWithConnectionInfo[]
): WebJSONResponse {
    /**
     * @type {}
     */
    const response: Partial<TConnection>[] = [];
    connections.forEach((connection) => {
        response.push({
            connectionId: connection.id,
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
