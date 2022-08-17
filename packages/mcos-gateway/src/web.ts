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

import { AdminServer } from "./adminServer.js";
import { AuthLogin } from "../../mcos-auth/src/index.js";
import { PatchServer } from "../../mcos-patch/src/index.js";
import { ShardServer } from "../../mcos-shard/src/index.js";
import { logger } from "mcos-logger/src/index.js";
import type { IncomingMessage, ServerResponse } from "node:http";

const log = logger.child({ service: "mcos:gateway:web" });

/**
 * Routes incomming HTTP requests
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @returns {ServerResponse}
 */
export async function httpListener(
    req: IncomingMessage,
    res: ServerResponse
): Promise<ServerResponse> {
    if (typeof req.url !== "undefined" && req.url.startsWith("/AuthLogin")) {
        log.debug("ssl routing request to login web server");
        return AuthLogin.getInstance().handleRequest(req, res);
    }

    // Healthcheck endpoint
    if (req.url === "/health") {
        log.debug("Health check");
        return res.writeHead(200, {}).end("Healthy");
    }

    if (
        req.url &&
        (req.url === "/admin/connections" ||
            req.url === "/admin/connections/resetAllQueueState" ||
            req.url.startsWith("/admin"))
    ) {
        log.debug("ssl routing request to admin web server");
        const response = await AdminServer.getAdminServer().handleRequest(req);
        return res
            .writeHead(response.code, response.headers)
            .end(response.body);
    }

    if (
        req.url === "/games/EA_Seattle/MotorCity/UpdateInfo" ||
        req.url === "/games/EA_Seattle/MotorCity/NPS" ||
        req.url === "/games/EA_Seattle/MotorCity/MCO"
    ) {
        log.debug("http routing request to patch server");
        return PatchServer.getInstance().handleRequest(req, res);
    }
    if (
        req.url === "/cert" ||
        req.url === "/key" ||
        req.url === "/registry" ||
        req.url === "/ShardList/"
    ) {
        log.debug("http routing request to shard server");
        return ShardServer.getInstance().handleRequest(req, res);
    }

    log.warn(
        `Unexpected request for ${req.url} from ${req.socket.remoteAddress}, skipping.`
    );
    res.statusCode = 404;
    return res.end("Not found");
}
