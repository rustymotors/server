// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import http = require("http");
import { IConfigurationFile } from "../../config/config";

import { logger } from "../../src/logger";

const castanetResponse = {
  body: Buffer.from("cafebeef00000000000003", "hex"),
  header: {
    type: "Content-Type",
    value: "application/octet-stream",
  },
};

// TODO: Combine these threes functions.
// The long-term plan is to actually have an update server,
// but it's very low priority
function patchUpdateInfo() {
  return castanetResponse;
}

function patchNPS() {
  return castanetResponse;
}

function patchMCO() {
  return castanetResponse;
}

/**
 * Generate a shard list web document
 * @param {JSON} config
 */
function generateShardList(serverConfig: IConfigurationFile["serverConfig"]) {
  return `[The Clocktower]
  Description=The Clocktower
  ShardId=44
  LoginServerIP=${serverConfig.ipServer}
  LoginServerPort=8226
  LobbyServerIP=${serverConfig.ipServer}
  LobbyServerPort=7003
  MCOTSServerIP=${serverConfig.ipServer}
  StatusId=0
  Status_Reason=
  ServerGroup_Name=Group - 1
  Population=88
  MaxPersonasPerUser=2
  DiagnosticServerHost=${serverConfig.ipServer}
  DiagnosticServerPort=80`;
}

function httpHandler(
  request: http.IncomingMessage,
  response: http.ServerResponse,
  serverConfiguration: IConfigurationFile
) {
  logger.info(
    `[PATCH] Request from ${request.socket.remoteAddress} for ${
      request.method
    } ${request.url}`
  );
  let responseData;
  switch (request.url) {
    case "/ShardList/":
      response.setHeader("Content-Type", "text/plain");
      response.end(generateShardList(serverConfiguration.serverConfig));
      break;

    case "/games/EA_Seattle/MotorCity/UpdateInfo":
      responseData = patchUpdateInfo();
      response.setHeader(responseData.header.type, responseData.header.value);
      response.end(responseData.body);
      break;
    case "/games/EA_Seattle/MotorCity/NPS":
      responseData = patchNPS();
      response.setHeader(responseData.header.type, responseData.header.value);
      response.end(responseData.body);
      break;
    case "/games/EA_Seattle/MotorCity/MCO":
      responseData = patchMCO();
      response.setHeader(responseData.header.type, responseData.header.value);
      response.end(responseData.body);
      break;

    default:
      response.end("foo");
      break;
  }
}

export default class PatchServer {
  public async start(configurationFile: IConfigurationFile) {
    const serverPatch = http.createServer((req, res) => {
      httpHandler(req, res, configurationFile);
    });
    serverPatch.listen({ port: "80", host: "0.0.0.0" }, () => {
      logger.info("[patchServer] Patch server is listening...");
    });
  }
}
