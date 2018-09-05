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

import * as fs from "fs";
import { IncomingMessage, ServerResponse } from "http";
import * as https from "https";
import { IServerConfiguration } from "./IServerConfiguration";
import { Logger } from "./logger";
import { MCServer } from "./MCServer";
import { SSLConfig } from "./ssl-config";

const logger = new Logger().getLogger();

export class AdminServer {
  public mcServer: MCServer;

  constructor(mcServer: MCServer) {
    this.mcServer = mcServer;
  }
  /**
   * Create the SSL options object
   */
  public _sslOptions(configuration: IServerConfiguration["serverConfig"]) {
    const sslConfig = new SSLConfig();
    return {
      cert: fs.readFileSync(configuration.certFilename),
      ciphers: sslConfig.ciphers,
      honorCipherOrder: true,
      key: fs.readFileSync(configuration.privateKeyFilename),
      rejectUnauthorized: false,
      secureOptions: sslConfig.minimumTLSVersion,
    };
  }

  public _httpsHandler(
    request: IncomingMessage,
    response: ServerResponse,
    config: IServerConfiguration["serverConfig"]
  ) {
    logger.info(
      `[Admin] Request from ${request.socket.remoteAddress} for ${
        request.method
      } ${request.url}`
    );
    switch (request.url) {
      case "/admin/connections":
        response.setHeader("Content-Type", "text/plain");
        const connections = this.mcServer.mgr.dumpConnections();
        connections.forEach((connection, index) => {
          const displayConnection = `
            index: ${index} - ${connection.id}
                remoteAddress: ${connection.remoteAddress}:${
            connection.localPort
          }
            `;
          response.write(displayConnection);
        });
        response.end();
        return;

      default:
        if (request.url && request.url.startsWith("/admin")) {
          response.end("Jiggawatt!");
          return;
        }
        response.statusCode = 404;
        response.end("Unknown request.");
        break;
    }
  }
  public async start(config: IServerConfiguration["serverConfig"]) {
    const httpsServer = https
      .createServer(
        this._sslOptions(config),
        (req: IncomingMessage, res: ServerResponse) => {
          this._httpsHandler(req, res, config);
        }
      )
      .listen({ port: 8888, host: "0.0.0.0" })
      .on("connection", socket => {
        socket.on("error", (error: Error) => {
          logger.error(`[AdminServer] SSL Socket Error: ${error.message}`);
        });
        socket.on("close", () => {
          logger.info("[AdminServer] SSL Socket Connection closed");
        });
      })
      .on("tlsClientError", err => {
        logger.error(`[AdminServer] tlsClientError: ${err}`);
      });
  }
}
