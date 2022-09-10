import type { ISocketRecord } from "mcos-types";
import { log, updateConnectionInDatabase } from "../adminServer.js";
import type { AdminServerResponse } from "./routeIndex.js";

/**
 * Send ok to login packet and update inQueue to false
 * @param {ISocketRecord[]} socketRecords
 * @param {URL} requestUrl
 * @returns {Promise<AdminServerResponse>}
 */

export async function releaseQueue(
    socketRecords: ISocketRecord[],
    requestUrl: URL
): Promise<AdminServerResponse> {
    if (requestUrl.searchParams.get("id") === null) {
        return {
            code: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "missing connection id" }),
        };
    }

    // We know this is not null, due to the check above
    const connectionId = requestUrl.searchParams.get("id") as string;

    log.debug(`Searching ${socketRecords.length} records`);
    const connectionToRelease = socketRecords.find((c) => {
        log.debug(c.id);
        return c.id === connectionId;
    });

    if (typeof connectionToRelease === "undefined") {
        return {
            code: 422,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "connection not found" }),
        };
    }

    // Send release packet
    connectionToRelease.socket.write(Buffer.from([0x02, 0x30, 0x00, 0x00]));

    // We don't need to block on the update
    updateConnectionInDatabase(connectionId);

    return {
        code: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "ok" }),
    };
}
