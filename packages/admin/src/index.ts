// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import P from "pino";
import { IncomingMessage, ServerResponse } from "http";
import { createServer, Server } from "https";
import { Socket } from "net";
import {
  _sslOptions,
  AppConfiguration,
  ConfigurationManager,
} from "mcos-config";
import { IMCServer } from "mcos-types";

const log = P().child({ service: "mcoserver:AdminServer;" });
log.level = process.env.LOG_LEVEL || "info";
/**
 * SSL web server for managing the state of the system
 */

/**
 * @property {config} config
 * @property {IMCServer} mcServer
 * @property {Server} httpServer
 */
export class AdminServer {
  static _instance: AdminServer;
  config: AppConfiguration;
  mcServer: IMCServer;
  httpsServer: Server | undefined;

  static getInstance(mcServer: IMCServer): AdminServer {
    if (!AdminServer._instance) {
      AdminServer._instance = new AdminServer(mcServer);
    }
    return AdminServer._instance;
  }

  private constructor(mcServer: IMCServer) {
    this.config = ConfigurationManager.getInstance().getConfig();
    this.mcServer = mcServer;
  }

  /**
   * @return {string}
   */
  _handleGetConnections(): string {
    const connections = this.mcServer.getConnections();
    let responseText = "";
    for (let i = 0; i < connections.length; i++) {
      const connection = connections[i];
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
   * @return {string}
   */
  _handleResetAllQueueState(): string {
    this.mcServer.clearConnectionQueue();
    const connections = this.mcServer.getConnections();
    let responseText = "Queue state reset for all connections\n\n";
    for (let i = 0; i < connections.length; i++) {
      const connection = connections[i];
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
   * @return {void}
   * @param {import("http").IncomingMessage} request
   * @param {import("http").ServerResponse} response
   */
  _httpsHandler(request: IncomingMessage, response: ServerResponse): void {
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
   * @returns {void}
   * @param {import("net").Socket} socket
   */
  _socketEventHandler(socket: Socket): void {
    socket.on("error", (error) => {
      throw new Error(`[AdminServer] SSL Socket Error: ${error.message}`);
    });
  }

  /**
   * @param {module:config.config} config
   * @return {Promise<void>}
   */
  start(): Server {
    const config = this.config;
    try {
      const sslOptions = _sslOptions(config.certificate);

      /** @type {import("https").Server} */
      this.httpsServer = createServer(
        sslOptions,
        (
          /** @type {import("http").IncomingMessage} */ request: import("http").IncomingMessage,
          /** @type {import("http").ServerResponse} */ response: import("http").ServerResponse
        ) => {
          this._httpsHandler(request, response);
        }
      );
    } catch (err) {
      const error = err as Error;
      throw new Error(`${error.message}, ${error.stack}`);
    }

    this.httpsServer.on("connection", this._socketEventHandler);

    const port = 88

    log.debug(`Attempting to bind to port ${port}`)

    return this.httpsServer.listen({ port, host: "0.0.0.0" }, () => {
      log.debug("port 88 listening");
    });
  }
}
