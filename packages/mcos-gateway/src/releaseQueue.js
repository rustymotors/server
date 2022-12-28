/**
 *
 * @param {import("./connections.js").SocketWithConnectionInfo[]} connections
 * @param {string} connectionId
 * @returns {{
    code: number;
    headers: import("node:http").OutgoingHttpHeaders | import("node:http").OutgoingHttpHeader[] | undefined | undefined;
    body: string;
}}
 */

export function releaseQueue(
    connections,
    connectionId
) {
    const connectionToRelease = connections.find((connection) => {
        return connection.id === connectionId;
    });
    if (typeof connectionToRelease === "undefined") {
        return {
            code: 422,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "connection not found" }),
        };
    }
    connectionToRelease.inQueue = false;
    connectionToRelease.socket.write(Buffer.from([0x02, 0x30, 0x00, 0x00]));
    return {
        code: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "ok" }),
    };
}
