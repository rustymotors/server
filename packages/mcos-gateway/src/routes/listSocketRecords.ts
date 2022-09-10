import { getAllConnections as fetchSocketRecords } from "../index.js";
import type { AdminServerResponse } from "./routeIndex.js";

/**
 * Fetch all socket records
 * @return {{
 *   code: number;
 *   headers: OutgoingHttpHeaders | OutgoingHttpHeader[] | undefined | undefined;
 *   body: string;
 * }}
 */

export async function listSocketRecords(): Promise<AdminServerResponse> {
    const socketRecords = fetchSocketRecords();

    const sockets: {
        id: string;
        address: string | undefined;
        port: number | undefined;
        isOpen: boolean;
        isWritable: boolean;
    }[] = [];
    socketRecords.forEach((r) => {
        sockets.push({
            id: r.id,
            address: r.socket.remoteAddress,
            port: r.socket.localPort,
            isOpen: r.socket.closed === false,
            isWritable: r.socket.writable,
        });
    });

    return {
        code: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sockets),
    };
}
