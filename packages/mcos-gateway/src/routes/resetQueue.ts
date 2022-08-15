import { prisma, log } from "../adminServer.js";
import type { AdminServerResponse } from "./routeIndex.js";

/**
 *  Reset the inQueue property of all connections to true
 * @returns {Promise<AdminServerResponse>}
 */

export async function resetQueue(): Promise<AdminServerResponse> {
    try {
        const resetConnectionList = await prisma.connection.updateMany({
            data: {
                inQueue: true,
            },
        });

        return {
            code: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(resetConnectionList),
        };
    } catch (error) {
        log.error(
            `Error resetting queue state for all connections: ${String(error)}`
        );
        return {
            code: 500,
            headers: { "Content-Type": "application/json" },
            body: `Error resetting queue state for all connections: ${String(
                error
            )}`,
        };
    }
}
