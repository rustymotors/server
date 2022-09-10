import { PrismaClient } from "@prisma/client";
import type { AdminServerResponse } from "./routeIndex.js";
export const prisma = new PrismaClient();

/**
 * Fetch all connection records
 * @return {Promise<AdminServerResponse>}
 */

export async function listConnections(): Promise<AdminServerResponse> {
    const connectionList = await prisma.connection.findMany({});

    return {
        code: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(connectionList),
    };
}
