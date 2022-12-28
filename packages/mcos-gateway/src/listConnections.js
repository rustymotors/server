/**
 *
 * @param {import("./connections.js").SocketWithConnectionInfo[]} connections
 * @returns {{
    code: number;
    headers: import("node:http").OutgoingHttpHeaders | import("node:http").OutgoingHttpHeader[] | undefined;
    body: string;
}}
 */

export function listConnections(connections) {
    /**
     * @type {{ id: string; remoteAddress: string; inQueue: boolean; }[]}
     */
    let response = [];
    connections.forEach((connection) => {
        response.push({
            id: connection.id,
            remoteAddress: `${connection.socket.remoteAddress}:${connection.localPort}`,
            inQueue: connection.inQueue
        });
    });

    return {
        code: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response)
    };
}
