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
import { CastanetResponse } from "../../patch/src/PatchServer.js";
import { generateShardList } from "../../shard/src/ShardServer.js";
import { getServerConfiguration } from "../../shared/Configuration.js";
import {
    handleGetCert,
    handleGetKey,
    handleGetRegistry,
} from "../../shard/src/index.js";

/**
 * Add web routes to the web server
 *
 * @param {import("fastify").FastifyInstance} webServer The web server
 */
export function addWebRoutes(webServer: import("fastify").FastifyInstance) {
    webServer.addContentTypeParser("*", function (request, payload, done) {
        var data = "";
        payload.on("data", (chunk) => {
            data += chunk;
        });
        payload.on("end", () => {
            done(null, data);
        });
    });

    webServer.get("/", async (_request, reply) => {
        return reply.send("Hello, world!");
    });

    webServer.post(
        "/games/EA_Seattle/MotorCity/UpdateInfo",
        (_request, reply) => {
            const response = CastanetResponse;
            reply.header(response.header.type, response.header.value);
            return reply.send(response.body);
        },
    );

    webServer.post("/games/EA_Seattle/MotorCity/NPS", (_request, reply) => {
        const response = CastanetResponse;
        reply.header(response.header.type, response.header.value);
        return reply.send(response.body);
    });

    webServer.post("/games/EA_Seattle/MotorCity/MCO", (_request, reply) => {
        const response = CastanetResponse;
        reply.header(response.header.type, response.header.value);
        return reply.send(response.body);
    });

    interface IQuerystring {
        username: string;
        password: string;
    }

    interface IHeaders {}

    interface IReply {}

    webServer.get<{
        Querystring: IQuerystring;
        Headers: IHeaders;
        Reply: IReply;
    }>("/AuthLogin", async (request, reply) => {
        const username = request.query.username;

        if (username === "new") {
            return reply.send(
                "Valid=TRUE\nTicket=5213dee3a6bcdb133373b2d4f3b9962758",
            );
        }

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
        const config = getServerConfiguration({});
        if (typeof config.host === "undefined") {
            throw new ServerError("No host defined in config");
        }
        return reply.send(handleGetCert(config));
    });

    webServer.get("/key", (_request, reply) => {
        const config = getServerConfiguration({});
        if (typeof config.host === "undefined") {
            throw new ServerError("No host defined in config");
        }
        return reply.send(handleGetKey(config));
    });

    webServer.get("/registry", (_request, reply) => {
        const config = getServerConfiguration({});
        if (typeof config.host === "undefined") {
            throw new ServerError("No host defined in config");
        }
        return reply.send(handleGetRegistry(config));
    });
}
