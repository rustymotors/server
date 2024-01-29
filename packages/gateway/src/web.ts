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

import { CastanetResponse } from "../../patch/src/PatchServer.js";
import { generateShardList } from "../../shard/src/ShardServer.js";
import { getServerConfiguration } from "../../shared/Configuration.js";
import {
    handleGetCert,
    handleGetKey,
    handleGetRegistry,
} from "../../shard/src/index.js";
import { checkPassword, getUser } from "../../../lib/nps/services/account.js";
import { generateToken } from "../../../lib/nps/services/token.js";
import AdminJSFastify from "@adminjs/fastify";
import FastifySession from "@fastify/session";
import AdminJS from "adminjs";
import * as AdminJSSequelize from "@adminjs/sequelize";
import { sequelize } from "../../database/src/services/database.js";
import { GameUser } from "../../database/src/models/GameUser.entity.js";

/**
 * Add web routes to the web server
 *
 * @param {import("fastify").FastifyInstance} webServer The web server
 */
export async function addWebRoutes(
    webServer: import("fastify").FastifyInstance,
) {
    const DEFAULT_ADMIN = {
        email: "admin@rusty-motors.com",
        password: "password",
    };

    const authenticate = async (email: string, password: string) => {
        if (
            email === DEFAULT_ADMIN.email &&
            password === DEFAULT_ADMIN.password
        ) {
            return DEFAULT_ADMIN;
        }
        return null;
    };

    AdminJS.registerAdapter({
        Database: AdminJSSequelize.Database,
        Resource: AdminJSSequelize.Resource,
    });

    const admin = new AdminJS({
        rootPath: "/admin",
        databases: [sequelize],
        resources: [GameUser],
        branding: {
            companyName: "Rusty Motors",
        },
    });

    const cookieSecret = "4NFXD64KwbMsA2OqQkhFjFJ9NmGlmffx";

    await AdminJSFastify.buildAuthenticatedRouter(
        admin,
        {
            authenticate,
            cookiePassword: cookieSecret,
            cookieName: "adminjs",
        },
        webServer,
        {
            saveUninitialized: true,
            secret: cookieSecret,
            cookie: {
                maxAge: 24 * 60 * 60 * 1000,
            },
        },
    );

    webServer.addContentTypeParser("*", function (request, payload, done) {
        let data = "";
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
        const password = request.query.password;

        // Check for the username
        const user = await getUser(username);

        // If the user doesn't exist, return an error
        if (user === null) {
            return reply.send(
                "reasoncode=INV-200\nreasontext=Opps~\nreasonurl=https://www.winehq.com",
            );
        }

        // Check the password
        if (!checkPassword(user, password)) {
            return reply.send("Valid=FALSE\nReason=Invalid password");
        }

        // Generate a token
        const token = generateToken(user.customerId);

        return reply.send(`Valid=TRUE\nTicket=${token}`);
    });

    webServer.get("/ShardList/", (_request, reply) => {
        const config = getServerConfiguration({});
        if (typeof config.host === "undefined") {
            throw new Error("No host defined in config");
        }
        return reply.send(generateShardList(config.host));
    });

    webServer.get("/cert", (_request, reply) => {
        const config = getServerConfiguration({});
        if (typeof config.host === "undefined") {
            throw new Error("No host defined in config");
        }
        return reply.send(handleGetCert(config));
    });

    webServer.get("/key", (_request, reply) => {
        const config = getServerConfiguration({});
        if (typeof config.host === "undefined") {
            throw new Error("No host defined in config");
        }
        return reply.send(handleGetKey(config));
    });

    webServer.get("/registry", (_request, reply) => {
        const config = getServerConfiguration({});
        if (typeof config.host === "undefined") {
            throw new Error("No host defined in config");
        }
        return reply.send(handleGetRegistry(config));
    });
}
