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

import { generateToken, getUser } from "@rustymotors/nps";
import { CastanetResponse } from "@rustymotors/patch";
import {
  generateShardList,
  handleGetCert,
  handleGetKey,
  handleGetRegistry,
} from "@rustymotors/shard";
import { getServerConfiguration } from "@rustymotors/shared";

/**
 * Add web routes to the web server
 *
 * @param {import("fastify").FastifyInstance} webServer The web server
 */
export function addWebRoutes(webServer: import("fastify").FastifyInstance) {
  webServer.addContentTypeParser("*", function (request, payload, done) {
    let data = "";
    payload.on("data", (chunk) => {
      data += chunk;
    });
    payload.on("end", () => {
      done(null, data);
    });
  });

  webServer.get("/", (_request, reply) => {
    return reply.send("Hello, world!");
  });

  webServer.post(
    "/games/EA_Seattle/MotorCity/UpdateInfo",
    (_request, reply) => {
      const response = CastanetResponse;
      return reply
        .header(response.header.type, response.header.value)
        .send(response.body);
    }
  );

  webServer.post("/games/EA_Seattle/MotorCity/NPS", (_request, reply) => {
    const response = CastanetResponse;
    void reply.header(response.header.type, response.header.value);
    return reply.send(response.body);
  });

  webServer.post("/games/EA_Seattle/MotorCity/MCO", (_request, reply) => {
    const response = CastanetResponse;
    return reply
      .header(response.header.type, response.header.value)
      .send(response.body);
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
    const user = await getUser(username, password);

    // If the user doesn't exist, return an error
    if (user === null) {
      return reply.send(
        "reasoncode=INV-200\nreasontext=Unable to login\nreasonurl=https://rusty-motors.com"
      );
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

  webServer.get("/cert", async (_request, reply) => {
    const config = getServerConfiguration({});
    if (typeof config.host === "undefined") {
      throw new Error("No host defined in config");
    }
    const certFile = await handleGetCert(config);
    return reply
      .header("Content-Type", "text/plain")
      .header("Content-Disposition", "attachment; filename=cert.crt")
      .send(certFile);
  });

  webServer.get("/key", async (_request, reply) => {
    const config = getServerConfiguration({});
    if (typeof config.host === "undefined") {
      throw new Error("No host defined in config");
    }
    const keyFile = await handleGetKey(config);
    return reply
      .header("Content-Type", "text/plain")
      .header("Content-Disposition", "attachment; filename=pub.key")
      .send(keyFile);
  });

  webServer.get("/registry", (_request, reply) => {
    const config = getServerConfiguration({});
    if (typeof config.host === "undefined") {
      throw new Error("No host defined in config");
    }
    const regFile = handleGetRegistry(config);
    return reply
      .header("Content-Type", "text/plain")
      .header("Content-Disposition", "attachment; filename=client.reg")
      .send(regFile);
  });
}
