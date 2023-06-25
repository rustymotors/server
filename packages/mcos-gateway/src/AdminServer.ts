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

import { getAllConnections } from "./ConnectionManager.js";
import { releaseQueue } from "./releaseQueue.js";
import { listConnections } from "./listConnections.js";
import { resetQueue } from "./resetQueue.js";
import { IncomingMessage } from "node:http";
import { TJSONResponse, TServerLogger } from "mcos/shared/interfaces";

/**
 * The admin server.
 * Please use {@link getAdminServer()} to get the single instance of this class.
 * @classdesc
 * @property {config} config
 * @property {IMCServer} mcServer
 * @property {Server} httpServer
 */
export class AdminServer {
    static _instance: AdminServer;

    _log: TServerLogger;

    constructor(log: TServerLogger) {
        this._log = log;
    }

    /**
     * Get the single instance of the class
     *
     */
    static getInstance(log: TServerLogger): AdminServer {
        if (typeof AdminServer._instance === "undefined") {
            AdminServer._instance = new AdminServer(log);
        }
        return AdminServer._instance;
    }

    /**
     * Handle incomming http requests
     *
     */
    handleRequest(request: IncomingMessage): TJSONResponse {
        this._log(
            "debug",
            `[Admin] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`
        );
        this._log(
            "debug",
            `Request received,
      ${JSON.stringify({
          url: request.url,
          remoteAddress: request.socket.remoteAddress,
      })}`
        );

        if (typeof request.url === "undefined") {
            return { code: 404, headers: {}, body: "" };
        }

        const connections = getAllConnections();

        if (request.url.startsWith("/admin/connections/releaseQueue")) {
            const connectionId = new URL(
                request.url,
                `http://${request.headers.host}`
            ).searchParams.get("id");
            if (connectionId === null) {
                return {
                    code: 400,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: "missing connection id" }),
                };
            }
            return releaseQueue(connections, connectionId);
        }
        if (request.url === "/admin/connections/resetQueue") {
            // We only use the code here, the body is used for testing
            const { code } = resetQueue(connections);
            return { code, headers: {}, body: "ok" };
        }

        if (request.url === "/admin/connections") {
            return listConnections(connections);
        }

        if (request.url.startsWith("/admin")) {
            return { code: 404, headers: {}, body: "Jiggawatt!" };
        }

        return { code: 404, headers: {}, body: "" };
    }
}

/**
 * Get the single instance of the AdminServer class
 */
export function getAdminServer(log: TServerLogger): AdminServer {
    return AdminServer.getInstance(log);
}
