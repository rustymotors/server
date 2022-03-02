// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import type { IncomingMessage, ServerResponse } from "http";
import { logger } from "../logger/index";
import { getConnectionManager } from "../core/connection-mgr";

const log = logger.child({ service: "mcoserver:AdminServer;" });

/**
 * @property {config} config
 * @property {IMCServer} mcServer
 * @property {Server} httpServer
 */
export class AdminServer {
  private static _instance: AdminServer;
  // httpsServer: Server | undefined;

  public static getAdminServer(this: void): AdminServer {
    if (!AdminServer._instance) {
      AdminServer._instance = new AdminServer();
    }
    return AdminServer._instance;
  }

  private constructor() {
    // Intentionally empty
  }

  /**
   * @return {string}
   */
  _handleGetConnections(): string {
    const connections = getConnectionManager().fetchConnectionList();
    let responseText = "";

    if (connections.length === 0) {
      return "No connections were found";
    }

    for (let i = 0; i < connections.length; i++) {
      const connection = connections[i];

      if (typeof connection.remoteAddress === "undefined") {
        connection.remoteAddress = "unknown";
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
   * @return {string}
   */
  _handleResetAllQueueState(): string {
    getConnectionManager().returnAllConnectionsToQueue();
    const connections = getConnectionManager().fetchConnectionList();
    let responseText = "Queue state reset for all connections\n\n";

    if (connections.length === 0) {
      return "No connections were found";
    }

    for (let i = 0; i < connections.length; i++) {
      const connection = connections[i];

      if (typeof connection.remoteAddress === "undefined") {
        connection.remoteAddress = "unknown";
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
   * @return {ServerResponse}
   * @param {import("http").IncomingMessage} request
   * @param {import("http").ServerResponse} response
   */
  public handleRequest(
    request: IncomingMessage,
    response: ServerResponse
  ): ServerResponse {
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
    }
    return response.end();
  }
}
