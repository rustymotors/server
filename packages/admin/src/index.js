// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const P = require("pino");
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
  /** @type {AppConfiguration} */
  config;
  /** @type {MCServer} */
  mcServer;
  /** @type {Server | undefined} */
  httpsServer;

  /**
   *
   * @param {MCServer | undefined} mcServer
   * @returns {AdminServer}
   */
  static getInstance(mcServer) {
    if (!AdminServer._instance) {
      AdminServer._instance = new AdminServer(mcServer);
    }
    return AdminServer._instance;
  }

  /**
   * @private
   * @param {MCServer} mcServer
   */
  constructor(mcServer) {
    this.config = getConfig();
    this.mcServer = mcServer;
  }

  /**
   * @private
   * @return {string}
   */
  _handleGetConnections() {
    const connections = this.mcServer.getConnections();
    let responseText = "";
    for (let i = 0; i < connections.length; i++) {
      const connection = connections[i];
      if (typeof connection === "undefined") {
        return "No connections were found";
      }
      const displayConnection = `
      index: ${i} - ${connection.id}
          remoteAddress: ${connection.remoteAddress}:${connection.localPort}
          Encryption ID: ${connection.getEncryptionId()}
          inQueue:       ${connection.inQueue}
      `;
      responseText += displayConnection;
    }

    return responseText;
  }

  /**
   * @private
   * @return {string}
   */
  _handleResetAllQueueState() {
    this.mcServer.clearConnectionQueue();
    const connections = this.mcServer.getConnections();
    let responseText = "Queue state reset for all connections\n\n";
    for (let i = 0; i < connections.length; i++) {
      const connection = connections[i];
      if (typeof connection === "undefined") {
        return responseText.concat("No connections found");
      }
      const displayConnection = `
      index: ${i} - ${connection.id}
          remoteAddress: ${connection.remoteAddress}:${connection.localPort}
          Encryption ID: ${connection.getEncryptionId()}
          inQueue:       ${connection.inQueue}
      `;
      responseText += displayConnection;
    }

    return responseText;
  }

  /**
   * @private
   * @param {import("http").IncomingMessage} request
   * @param {import("http").ServerResponse} response
   */
  _httpsHandler(request, response) {
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
        return response.end(this._handleGetConnections());

      case "/admin/connections/resetAllQueueState":
        response.setHeader("Content-Type", "text/plain");
        return response.end(this._handleResetAllQueueState());

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
   * @return {Server}
   */
  start() {
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
          this._httpsHandler(request, response);
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
