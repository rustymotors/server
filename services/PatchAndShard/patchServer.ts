// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as http from "http";
import * as fs from "fs";
import * as yaml from "js-yaml";
import { IServerConfiguration } from "../shared/interfaces/IServerConfiguration";
import { Logger } from "../shared/logger";
import { ShardEntry } from "./ShardEntry";

const CONFIG: IServerConfiguration = yaml.safeLoad(
  fs.readFileSync("./services/shared/config.yml", "utf8")
);

const { serverConfig } = CONFIG;

const logger = new Logger().getLogger();

const banList: string[] = [];

/**
 * A simulated patch server response
 */
const castanetResponse = {
  body: Buffer.from("cafebeef00000000000003", "hex"),
  header: {
    type: "Content-Type",
    value: "application/octet-stream",
  },
};

/**
 * Simulate a response from a patch server
 */
function patchUpdateInfo() {
  return castanetResponse;
}

/**
 * Simulate a response from a patch server
 */
function patchNPS() {
  return castanetResponse;
}

/**
 * Simulate a response from a patch server
 */
function patchMCO() {
  return castanetResponse;
}

/**
 * Generate a shard list web document
 * @param {JSON} config
 */
function generateShardList() {
  const shardClockTower = new ShardEntry(
    "The Clocktower",
    "The Clocktower",
    44,
    serverConfig.ipServer,
    8226,
    serverConfig.ipServer,
    7003,
    serverConfig.ipServer,
    0,
    "",
    "Group-1",
    88,
    2,
    serverConfig.ipServer,
    80
  );
  const shardTwinPinesMall = new ShardEntry(
    "Twin Pines Mall",
    "Twin Pines Mall",
    88,
    serverConfig.ipServer,
    8226,
    serverConfig.ipServer,
    7003,
    serverConfig.ipServer,
    0,
    "",
    "Group-1",
    88,
    2,
    serverConfig.ipServer,
    80
  );

  const shardList = [];
  shardList.push(shardClockTower.formatForShardList());
  // shardList.push(shardTwinPinesMall.formatForShardList());

  return shardList.join("\n");
}
function _httpHandler(
  request: http.IncomingMessage,
  response: http.ServerResponse
) {
  let responseData;
  switch (request.url) {
    case "/ShardList/":
      response.setHeader("Content-Type", "text/plain");
      response.end(generateShardList());
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
      // Is this a hacker?
      if (banList.indexOf(request.socket.remoteAddress!) < 0) {
        // In ban list, skip
        break;
      }
      // Unknown request, log it
      logger.debug(
        `[PATCH] Unknown Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}, banning.`
      );
      banList.push(request.socket.remoteAddress!);
      response.end("foo");
      break;
  }
}

function getBans() {
  return banList;
}

export async function start() {
  const serverPatch = http.createServer((req, res) => {
    _httpHandler(req, res);
  });
  serverPatch.listen({ port: "80", host: "0.0.0.0" }, () => {
    logger.debug("[patchServer] Patch server is listening...");
  });
}
