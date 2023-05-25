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

import { AuthLogin } from "../../mcos-auth/index.js";
import { PatchServer } from "../../mcos-patch/index.js";
import { ShardServer } from "../../mcos-shard/index.js";
import { AdminServer } from "./adminServer.js";

/**
 * @module mcos-gateway
 */

/**
 * Routes incomming HTTP requests
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @param {TServerConfiguration} config
 * @param {TServerLogger} log
 * @returns {ServerResponse}
 */
export function httpListener(req, res, config, log) {
    if (typeof req.url !== "undefined" && req.url.startsWith("/AuthLogin")) {
        log("debug", "ssl routing request to login web server");
        return AuthLogin.getInstance(log).handleRequest(req, res);
    }

    if (
        req.url &&
        (req.url === "/admin/connections" ||
            req.url === "/admin/connections/resetAllQueueState" ||
            req.url.startsWith("/admin"))
    ) {
        log("debug", "ssl routing request to admin web server");
        const response = AdminServer.getAdminServer(log).handleRequest(req);
        return res
            .writeHead(response.code, response.headers)
            .end(response.body);
    }

    if (
        req.url === "/games/EA_Seattle/MotorCity/UpdateInfo" ||
        req.url === "/games/EA_Seattle/MotorCity/NPS" ||
        req.url === "/games/EA_Seattle/MotorCity/MCO"
    ) {
        log("debug", "http routing request to patch server");
        return PatchServer.getInstance(log).handleRequest(req, res);
    }
    if (
        req.url === "/cert" ||
        req.url === "/key" ||
        req.url === "/registry" ||
        req.url === "/ShardList/"
    ) {
        log("debug", "http routing request to shard server");
        return ShardServer.getInstance(config, log).handleRequest(req, res);
    }

    log(
        "debug",
        `Unexpected request for ${req.url} from ${req.socket.remoteAddress}, skipping.`
    );
    res.statusCode = 404;
    return res.end("Not found");
}
