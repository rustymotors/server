// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { pino: P } = require("pino");
const { createServer } = require("https");
const { getConfig } = require("../../config/src/index.js");
const { _sslOptions } = require("../../config/src/ssl-options.js");
const process = require("process");

const log = P().child({ service: "mcos:AdminServer;" });
log.level = process.env["LOG_LEVEL"] || "info";
/**
 * SSL web server for managing the state of the system
 */

class AdminServer {
  /** @type {AdminServer} */
  static _instance;
  /** @type {import("../../config/src/index").AppConfiguration} */
  config;
  /** @type {import("https").Server | undefined} */
  httpsServer;

  /**
   *
   * @returns {AdminServer}
   */
  static getInstance() {
    if (!AdminServer._instance) {
      AdminServer._instance = new AdminServer();
    }
    return AdminServer._instance;
  }

  /**
   * @private
   */
  constructor() {
    this.config = getConfig();
  }

  /**
   * @private
   * @param {import("http").IncomingMessage} request
   * @param {import("http").ServerResponse} response
   * @param {import("../../core/src/connection-mgr").ConnectionManager} connectionManager
   */
  _httpsHandler(request, response, connectionManager) {
    log.info(
      `[Admin] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`
    );
    log.info(
      `Request received,
      ${JSON.stringify({
        url: request.url,
        remoteAddress: request.socket.remoteAddress,
      })}`
    );
    switch (request.url) {
      case "/admin/connections":
        response.setHeader("Content-Type", "text/plain");
        return response.end(connectionManager.handleGetConnections());

      case "/admin/connections/resetAllQueueState":
        response.setHeader("Content-Type", "text/plain");
        return response.end(connectionManager.handleResetAllQueueState());

      default:
        if (request.url && request.url.startsWith("/admin")) {
          return response.end("Jiggawatt!");
        }

        response.statusCode = 404;
        response.end("Unknown request.");
        break;
    }
  }

  /**
   * @param {import("net").Socket} socket
   */
  _socketEventHandler(socket) {
    socket.on("error", (error) => {
      throw new Error(`[AdminServer] SSL Socket Error: ${error.message}`);
    });
  }

  /**
   * @param {import("../../core/src/connection-mgr").ConnectionManager} connectionManager
   * @return {import("https").Server}
   */
  start(connectionManager) {
    const config = this.config;
    try {
      const sslOptions = _sslOptions(config.certificate);

      /** @type {import("https").Server} */
      this.httpsServer = createServer(
        sslOptions,
        (
          /** @type {import("http").IncomingMessage} */ request,
          /** @type {import("http").ServerResponse} */ response
        ) => {
          this._httpsHandler(request, response, connectionManager);
        }
      );
    } catch (err) {
      if (err instanceof Error) {
        log.error(`Error starting admin server: ${err.message}`);
        throw new Error(`${err.message}, ${err.stack}`);
      }
      throw new Error(err.toString());
    }

    this.httpsServer.on("connection", this._socketEventHandler);

    const port = 88;

    log.debug(`Attempting to bind to port ${port}`);

    return this.httpsServer.listen({ port, host: "0.0.0.0" }, () => {
      log.debug("port 88 listening");
    });
  }
}
module.exports = { AdminServer };
