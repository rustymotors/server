/**
 *
 * @param {TSocketWithConnectionInfo[]} connections
 * @param {string} connectionId
 * @returns {TJSONResponse}
 */

import { TSocketWithConnectionInfo } from "mcos/shared";
import { TJSONResponse } from "./adminServer";

export function releaseQueue(connections: TSocketWithConnectionInfo[], connectionId: string): TJSONResponse {
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
