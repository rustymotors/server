// @ts-check
// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { logger } from "mcos-shared/logger";
import { readFileSync } from "node:fs";
import { ShardEntry } from "./shard-entry.js";
import { createServer } from "node:https";

// This section of the server can not be encrypted. This is an intentional choice for compatibility
// deepcode ignore HttpToHttps: This is intentional. See above note.
const log = logger.child({ service: "MCOServer:Shard" });

/**
 * Manages patch and update server connections
 * Also handles the shard list, and some utility endpoints
 * TODO: Document the endpoints
 */

/**
 *
 *
 * @export
 * @class ShardServer
 */
export class ShardServer {
  /**
   *
   *
   * @static
   * @internal
   * @type {ShardServer}
   * @memberof ShardServer
   */
  static instance;
  /**
   *
   *
   * @private
   * @type {string[]}
   * @memberof ShardServer
   */
  _possibleShards= [];
  /**
   *
   *
   * @private
   * @type {import("node:http").Server}
   * @memberof ShardServer
   */
  _server;
  /**
   *
   *
   * @type {import("mcos-shared/config").AppConfiguration}
   * @memberof ShardServer
   */
  config;

  /**
   * Return the instance of the ShardServer class
   * @param {import("mcos-shared/config").AppConfiguration} config
   * @returns {ShardServer}
   */
  static getInstance(config) {
    if (typeof ShardServer.instance === "undefined") {
      ShardServer.instance = new ShardServer(config);
    }
    return ShardServer.instance;
  }

  /**
   * Creates an instance of ShardServer.
   * 
   * Please use {@link ShardServer.getInstance()} instead
   * @internal
   * @param {import("mcos-shared/config").AppConfiguration} config
   * @memberof ShardServer
   */
  constructor(config) {
    this._server = createServer(this.handleRequest.bind(this));
    this.config = config;

    this._server.on("error", (error) => {
      process.exitCode = -1;
      log.error(`Server error: ${error.message}`);
      log.info(`Server shutdown: ${process.exitCode}`);
      process.exit();
    });
  }

  /**
   * Generate a shard list web document
   *
   * @private
   * @return {string}
   * @memberof! PatchServer
   */
  _generateShardList() {
    if (!this.config.MCOS.SETTINGS.SHARD_EXTERNAL_HOST) {
      throw new Error(`Please set MCOS__SETTINGS__SHARD_EXTERNAL_HOST`);
    }
    const shardHost = this.config.MCOS.SETTINGS.SHARD_EXTERNAL_HOST;
    const shardClockTower = new ShardEntry(
      "The Clocktower",
      "The Clocktower",
      44,
      shardHost,
      8226,
      shardHost,
      7003,
      shardHost,
      0,
      "",
      "Group-1",
      88,
      2,
      shardHost,
      80
    );

    this._possibleShards.push(shardClockTower.formatForShardList());

    const shardTwinPinesMall = new ShardEntry(
      "Twin Pines Mall",
      "Twin Pines Mall",
      88,
      shardHost,
      8226,
      shardHost,
      7003,
      shardHost,
      0,
      "",
      "Group-1",
      88,
      2,
      shardHost,
      80
    );

    this._possibleShards.push(shardTwinPinesMall.formatForShardList());

    /** @type {string[]} */
    const activeShardList = [];
    activeShardList.push(shardClockTower.formatForShardList());

    return activeShardList.join("\n");
  }

  /**
   *
   * @private
   * @return {string}
   * @memberof! WebServer
   */
  _handleGetCert() {
    if (!this.config.MCOS.CERTIFICATE.CERTIFICATE_FILE) {
      throw new Error("Pleas set MCOS__CERTIFICATE__CERTIFICATE_FILE");
    }
    return readFileSync(
      this.config.MCOS.CERTIFICATE.CERTIFICATE_FILE
    ).toString();
  }

  /**
   *
   * @private
   * @return {string}
   * @memberof! WebServer
   */
  _handleGetKey() {
    if (!this.config.MCOS.CERTIFICATE.PUBLIC_KEY_FILE) {
      throw new Error("Please set MCOS__CERTIFICATE__PUBLIC_KEY_FILE");
    }
    return readFileSync(
      this.config.MCOS.CERTIFICATE.PUBLIC_KEY_FILE
    ).toString();
  }

  /**
   *
   * @private
   * @return {string}
   * @memberof! WebServer
   */
  _handleGetRegistry() {
    if (!this.config.MCOS.SETTINGS.AUTH_EXTERNAL_HOST) {
      throw new Error("Please set MCOS__SETTINGS__AUTH_EXTERNAL_HOST");
    }
    if (!this.config.MCOS.SETTINGS.SHARD_EXTERNAL_HOST) {
      throw new Error("Please set MCOS__SETTINGS__SHARD_EXTERNAL_HOST");
    }
    if (!this.config.MCOS.SETTINGS.PATCH_EXTERNAL_HOST) {
      throw new Error("Please set MCOS__SETTINGS__PATCH_EXTERNAL_HOST");
    }
    const patchHost = this.config.MCOS.SETTINGS.PATCH_EXTERNAL_HOST;
    const authHost = this.config.MCOS.SETTINGS.AUTH_EXTERNAL_HOST;
    const shardHost = this.config.MCOS.SETTINGS.SHARD_EXTERNAL_HOST;
    return `Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\EACom\\AuthAuth]
"AuthLoginBaseService"="AuthLogin"
"AuthLoginServer"="${authHost}"

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Electronic Arts\\Motor City]
"GamePatch"="games/EA_Seattle/MotorCity/MCO"
"UpdateInfoPatch"="games/EA_Seattle/MotorCity/UpdateInfo"
"NPSPatch"="games/EA_Seattle/MotorCity/NPS"
"PatchServerIP"="${patchHost}"
"PatchServerPort"="80"
"CreateAccount"="${authHost}/SubscribeEntry.jsp?prodID=REG-MCO"
"Language"="English"

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Electronic Arts\\Motor City\\1.0]
"ShardUrl"="http://${shardHost}/ShardList/"
"ShardUrlDev"="http://${shardHost}/ShardList/"

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Electronic Arts\\Motor City\\AuthAuth]
"AuthLoginBaseService"="AuthLogin"
"AuthLoginServer"="${authHost}"

[HKEY_LOCAL_MACHINE\\Software\\WOW6432Node\\Electronic Arts\\Network Play System]
"Log"="1"

`;
  }

  /**
   * Handle incoming http requests
   * @return {import("node:http").ServerResponse}
   * @param {import("http").IncomingMessage} request
   * @param {import("http").ServerResponse} response
   */
  // deepcode ignore NoRateLimitingForExpensiveWebOperation: Very unlikely to be DDos'ed
  handleRequest(
    request,
    response
  ) {
    if (request.url === "/cert") {
      response.setHeader(
        "Content-disposition",
        "attachment; filename=cert.pem"
      );
      return response.end(this._handleGetCert());
    }

    if (request.url === "/key") {
      response.setHeader("Content-disposition", "attachment; filename=pub.key");
      return response.end(this._handleGetKey());
    }

    if (request.url === "/registry") {
      response.setHeader("Content-disposition", "attachment; filename=mco.reg");
      return response.end(this._handleGetRegistry());
    }

    if (request.url === "/") {
      response.statusCode = 404;
      return response.end("Hello, world!");
    }

    if (request.url === "/ShardList/") {
      log.debug(
        `Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`
      );

      response.setHeader("Content-Type", "text/plain");
      return response.end(this._generateShardList());
    }

    // Is this a hacker?
    response.statusCode = 404;
    response.end("");

    // Unknown request, log it
    log.info(
      `Unknown Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`
    );
    return response;
  }

  /**
   * Start the shard server listener
   * @returns {import("node:http").Server}
   */
  start() {
    if (!this.config.MCOS.SETTINGS.SHARD_LISTEN_HOST) {
      throw new Error("Please set MCOS__SETTINGS__SHARD_LISTEN_HOST");
    }
    const host = this.config.MCOS.SETTINGS.SHARD_LISTEN_HOST;
    const port = 80;
    log.debug(`Attempting to bind to port ${port}`);
    return this._server.listen({ port, host }, () => {
      log.debug(`port ${port} listening`);
      log.info("Shard server is listening...");
    });
  }
}
