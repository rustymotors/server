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

import { logger } from "../../mcos-shared/src/logger/index.js";
import { getAllConnections } from "./index.js";

const log = logger.child({ service: "mcos:gateway:admin" });

/**
 * Please use {@link AdminServer.getAdminServer()}
 * @classdesc
 * @property {config} config
 * @property {IMCServer} mcServer
 * @property {Server} httpServer
 */
export class AdminServer {
  /**
   *
   *
   * @private
   * @static
   * @type {AdminServer}
   * @memberof AdminServer
   */
  static _instance: AdminServer;

  /**
   * Get the single instance of the class
   *
   * @static
   * @return {AdminServer}
   * @memberof AdminServer
   */
  static getAdminServer(): AdminServer {
    if (!AdminServer._instance) {
      AdminServer._instance = new AdminServer();
    }
    return AdminServer._instance;
  }

  /**
   * Creates an instance of AdminServer.
   *
   * Please use {@link AdminServer.getInstance()} instead
   * @internal
   * @memberof AdminServer
   */

  /**
   * @private
   * @return {string}
   */
  _handleGetConnections(): string {
    const connections = getAllConnections();
    let responseText = "";

    connections.forEach((connection, index) => {
      const displayConnection = `
      index: ${index} - ${connection.id}
          remoteAddress: ${connection.socket.remoteAddress}:${connection.localPort}
          inQueue:       ${connection.inQueue}
      `;
      responseText += displayConnection;
    });

    return responseText;
  }

  /**
   * Handle incomming http requests
   *
   * @return {import("node:http").ServerResponse}
   * @param {import("http").IncomingMessage} request
   * @param {import("http").ServerResponse} response
   */
  handleRequest(
    request: import("http").IncomingMessage,
    response: import("http").ServerResponse
  ): import("node:http").ServerResponse {
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

    let responseString = "";

    // TODO: #1209 Add /admin/connections/resetAllQueueState handler back
    switch (request.url) {
      case "/admin/connections": {
        response.setHeader("Content-Type", "text/plain");
        response.statusCode = 200;
        responseString = this._handleGetConnections();
        break;
      }
      default: {
        if (request.url && request.url.startsWith("/admin")) {
          response.statusCode = 404;
          responseString = "Jiggawatt!";
        }
        break;
      }
    }
    return response.end(responseString);
  }
}
