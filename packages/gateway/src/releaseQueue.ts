/**
 *
 * @param {TSocketWithConnectionInfo[]} connections
 * @param {string} connectionId
 * @returns {TJSONResponse}
 */

import { SocketWithConnectionInfo, WebJSONResponse } from "../../interfaces/index.js";


export function releaseQueue(
    connections: SocketWithConnectionInfo[],
    connectionId: string
): WebJSONResponse {
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
    // Send a packet to the client to tell them they're no longer in the queue
    // packet format: 02 30 00 00
    // 0x02 0x30 = _Q_POSITION
    // 0x00 = position in queue
    // 0x00 = count of players in queue
    connectionToRelease.socket.write(Buffer.from([0x02, 0x30, 0x00, 0x00]));
    return {
        code: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "ok" }),
    };
}
