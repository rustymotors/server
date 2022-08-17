// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { PrismaClient } from "@prisma/client";
import { logger } from "mcos-logger/src/index.js";
import type {
    IncomingMessage,
    OutgoingHttpHeader,
    OutgoingHttpHeaders,
} from "node:http";
import { getAllConnections as fetchSocketRecords } from "./index.js";
import { AdminServerResponse, routes } from "./routes/routeIndex.js";
export const prisma = new PrismaClient();

export const log = logger.child({ service: "mcos:gateway:admin" });

/**
 * Please use {@link AdminServer.getAdminServer()}
 * @classdesc
 * @property {config} config
 * @property {IMCServer} mcServer
 * @property {Server} httpServer
 */
export class AdminServer {
    /**
     *
     *
     * @private
     * @static
     * @type {AdminServer}
     * @memberof AdminServer
     */
    static _instance: AdminServer;

    /**
     * Get the single instance of the class
     *
     * @static
     * @return {AdminServer}
     * @memberof AdminServer
     */
    static getAdminServer(): AdminServer {
        if (typeof AdminServer._instance === "undefined") {
            AdminServer._instance = new AdminServer();
        }
        return AdminServer._instance;
    }

    /**
     * Creates an instance of AdminServer.
     *
     * Please use {@link AdminServer.getInstance()} instead
     * @internal
     * @memberof AdminServer
     */

    /**
     * Handle incomming http requests
     *
     * @param {IncomingMessage} request
     * @return {Promise<{
     *   code: number; headers: OutgoingHttpHeaders |
     *       OutgoingHttpHeader[] |
     *       undefined |
     *       undefined; body: string;
     * }>}
     */
    async handleRequest(request: IncomingMessage): Promise<{
        code: number;
        headers:
            | OutgoingHttpHeaders
            | OutgoingHttpHeader[]
            | undefined
            | undefined;
        body: string;
    }> {
        log.info(
            `[Admin] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`
        );
        log.info(
            `Request received,
      ${JSON.stringify({
          url: request.url,
          remoteAddress: request.socket.remoteAddress,
      })}`
        );

        const socketRecords = fetchSocketRecords();
        log.debug(`There are ${socketRecords.length} socket records`);

        const requestUrl = parseUrl(request);

        // New style route handlers
        for (const route of routes) {
            if (route?.routeMatch(requestUrl) === true) {
                return route.handler(socketRecords, requestUrl);
            }
        }

        return { code: 404, headers: {}, body: "" };
    }
}

function parseUrl(request: IncomingMessage) {
    return new URL(request.url || "", `http://${request.headers.host}`);
}

/**
 * Fetch all session records
 * @return {{
 *   code: number;
 *   headers: OutgoingHttpHeaders | OutgoingHttpHeader[] | undefined | undefined;
 *   body: string;
 * }}
 */
export async function listSessions(): Promise<AdminServerResponse> {
    const connectionList = await prisma.session.findMany({});

    return {
        code: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(connectionList),
    };
}

export async function updateConnectionInDatabase(
    connectionId: string
): Promise<void> {
    await prisma.connection
        .update({
            where: {
                id: connectionId,
            },
            data: {
                inQueue: false,
            },
        })
        .catch((error: unknown) => {
            log.error(`Error removing connection from queue: ${String(error)}`);
        })
        .finally(() => {
            log.info(`Removed connection id (${connectionId}) from queue`);
        });
}
