/**
 * Fetch all connection records
 * @return {Promise<AdminServerResponse>}
 */

import type { AdminServerResponse } from "./routeIndex.js";

export async function defaultAdminRoute(): Promise<AdminServerResponse> {
    return { code: 404, headers: {}, body: "Jiggawatt!" };
}
