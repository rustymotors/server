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

import { ServerError } from "../../shared/errors/ServerError.js";
import { getPatchServer } from "../../patch/src/PatchServer.mjs";
import { generateShardList } from "../../shard/src/ShardServer.js";
import { getServerConfiguration } from "../../shared/Configuration.js";

/**
 * Add web routes to the web server
 *
 * @param {import("fastify").FastifyInstance} webServer The web server
 */
export function addWebRoutes(webServer) {
    webServer.get("/", async (_request, reply) => {
        return reply.send("Hello, world!");
    });

    webServer.get(
        "/games/EA_Seattle/MotorCity/UpdateInfo",
        (_request, reply) => {
            const response = getPatchServer().castanetResponse;
            return reply.send(response);
        },
    );

    webServer.get("/games/EA_Seattle/MotorCity/NPS", (_request, reply) => {
        const response = getPatchServer().castanetResponse;
        return reply.send(response);
    });

    webServer.get("/games/EA_Seattle/MotorCity/MCO", (_request, reply) => {
        const response = getPatchServer().castanetResponse;
        return reply.send(response);
    });

    webServer.get("/AuthLogin", (_request, reply) => {
        return reply.send(
            "Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e",
        );
    });

    webServer.get("/ShardList/", (_request, reply) => {
        const config = getServerConfiguration({});
        if (typeof config.host === "undefined") {
            throw new ServerError("No host defined in config");
        }
        return reply.send(generateShardList(config.host));
    });

    webServer.get("/cert", (_request, reply) => {
        return reply.send("Hello, world!");
    });

    webServer.get("/key", (_request, reply) => {
        return reply.send("Hello, world!");
    });

    webServer.get("/registry", (_request, reply) => {
        return reply.send("Hello, world!");
    });
}
