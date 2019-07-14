// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as http from "http";
import { IServerConfiguration } from "../shared/interfaces/IServerConfiguration";
import { ILoggers } from "../shared/logger";
import { ShardEntry } from "./ShardEntry";

export class PatchServer {
  public config: IServerConfiguration;
  public loggers: ILoggers;
  public banList: string[] = [];

  /**
   * A simulated patch server response
   */
  public castanetResponse = {
    body: Buffer.from("cafebeef00000000000003", "hex"),
    header: {
      type: "Content-Type",
      value: "application/octet-stream",
    },
  };

  constructor(config: IServerConfiguration, loggers: ILoggers) {
    this.config = config;
    this.loggers = loggers;
  }

  /**
   * Simulate a response from a patch server
   */
  public _patchUpdateInfo() {
    return this.castanetResponse;
  }

  /**
   * Simulate a response from a patch server
   */
  public _patchNPS() {
    return this.castanetResponse;
  }

  /**
   * Simulate a response from a patch server
   */
  public _patchMCO() {
    return this.castanetResponse;
  }

  /**
   * Generate a shard list web document
   * @param {JSON} config
   */
  public _generateShardList() {
    const { ipServer } = this.config.serverConfig;
    const shardClockTower = new ShardEntry(
      "The Clocktower",
      "The Clocktower",
      44,
      ipServer,
      8226,
      ipServer,
      7003,
      ipServer,
      0,
      "",
      "Group-1",
      88,
      2,
      ipServer,
      80
    );
    const shardTwinPinesMall = new ShardEntry(
      "Twin Pines Mall",
      "Twin Pines Mall",
      88,
      ipServer,
      8226,
      ipServer,
      7003,
      ipServer,
      0,
      "",
      "Group-1",
      88,
      2,
      ipServer,
      80
    );

    const shardList = [];
    shardList.push(shardClockTower.formatForShardList());
    // shardList.push(shardTwinPinesMall.formatForShardList());

    return shardList.join("\n");
  }
  public _httpHandler(
    request: http.IncomingMessage,
    response: http.ServerResponse
  ) {
    let responseData;
    switch (request.url) {
      case "/ShardList/":
        response.setHeader("Content-Type", "text/plain");
        response.end(this._generateShardList());
        break;

      case "/games/EA_Seattle/MotorCity/UpdateInfo":
        responseData = this._patchUpdateInfo();
        response.setHeader(responseData.header.type, responseData.header.value);
        response.end(responseData.body);
        break;
      case "/games/EA_Seattle/MotorCity/NPS":
        responseData = this._patchNPS();
        response.setHeader(responseData.header.type, responseData.header.value);
        response.end(responseData.body);
        break;
      case "/games/EA_Seattle/MotorCity/MCO":
        responseData = this._patchMCO();
        response.setHeader(responseData.header.type, responseData.header.value);
        response.end(responseData.body);
        break;

      default:
        // Is this a hacker?
        if (this.banList.indexOf(request.socket.remoteAddress!) < 0) {
          // In ban list, skip
          break;
        }
        // Unknown request, log it
        this.loggers.both.debug(
          `[PATCH] Unknown Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}, banning.`
        );
        this.banList.push(request.socket.remoteAddress!);
        response.end("foo");
        break;
    }
  }

  public _getBans() {
    return this.banList;
  }

  public async start() {
    const serverPatch = http.createServer((req, res) => {
      this._httpHandler(req, res);
    });
    serverPatch.listen({ port: "80", host: "0.0.0.0" }, () => {
      this.loggers.both.debug("[patchServer] Patch server is listening...");
    });
  }
}
