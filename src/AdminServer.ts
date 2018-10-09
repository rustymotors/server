// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as fs from "fs";
import { IncomingMessage, ServerResponse } from "http";
import * as https from "https";
import { IServerConfiguration } from "./IServerConfiguration";
import { ILoggerInstance } from "./logger";
import { MCServer } from "./MCServer";
import { PatchServer } from "./patchServer";
import { SSLConfig } from "./ssl-config";

export class AdminServer {
  public mcServer: MCServer;
  public patchServer: PatchServer;
  public logger: ILoggerInstance;

  constructor(
    patchServer: PatchServer,
    mcServer: MCServer,
    logger: ILoggerInstance
  ) {
    this.patchServer = patchServer;
    this.mcServer = mcServer;
    this.logger = logger;
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
    this.logger.info(
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
            Encryption ID: ${connection.enc.getId()}
            `;
          response.write(displayConnection);
        });
        response.end();
        return;

      case "/admin/bans":
        response.setHeader("Content-Type", "application/json");
        const banlist = {
          mcServer: this.mcServer.mgr.getBans(),
          patchServer: this.patchServer.getBans(),
        };
        response.end(JSON.stringify(banlist));
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
      .listen({ port: 88, host: "0.0.0.0" })
      .on("connection", socket => {
        socket.on("error", (error: Error) => {
          throw new Error(`[AdminServer] SSL Socket Error: ${error.message}`);
        });
      });
  }
}
