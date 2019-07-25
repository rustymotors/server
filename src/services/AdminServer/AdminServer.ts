// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as fs from "fs";
import { IncomingMessage, ServerResponse } from "http";
import * as https from "https";
import { IServerConfiguration } from "../shared/interfaces/IServerConfiguration";
import { MCServer } from "../MCServer/MCServer";
import * as bunyan from "bunyan";
import { Logger } from "../../loggerManager";

export class AdminServer {
  public mcServer: MCServer;
  public logger: bunyan;

  constructor(mcServer: MCServer) {
    this.mcServer = mcServer;
    this.logger = new Logger().getLogger("AdminServer");
  }
  /**
   * Create the SSL options object
   */
  public _sslOptions(configuration: IServerConfiguration["serverConfig"]) {
    return {
      cert: fs.readFileSync(configuration.certFilename),
      honorCipherOrder: true,
      key: fs.readFileSync(configuration.privateKeyFilename),
      rejectUnauthorized: false,
    };
  }

  public _handleGetBans() {
    const banlist = {
      mcServer: this.mcServer.mgr.getBans(),
    };
    return JSON.stringify(banlist);
  }

  public _handleGetConnections() {
    const connections = this.mcServer.mgr.dumpConnections();
    let responseText: string = "";
    connections.forEach((connection, index) => {
      const displayConnection = `
        index: ${index} - ${connection.id}
            remoteAddress: ${connection.remoteAddress}:${connection.localPort}
            Encryption ID: ${connection.enc.getId()}
            inQueue:       ${connection.inQueue}
        `;
      responseText += displayConnection;
    });
    return responseText;
  }

  public _httpsHandler(request: IncomingMessage, response: ServerResponse) {
    this.logger.info(
      `[Admin] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`
    );
    this.logger.info(
      {
        url: request.url,
        remoteAddress: request.connection.remoteAddress,
      },
      "Requested recieved"
    );
    switch (request.url) {
      case "/admin/connections":
        response.setHeader("Content-Type", "text/plain");
        return response.end(this._handleGetConnections());

      case "/admin/bans":
        response.setHeader("Content-Type", "application/json");
        return response.end(this._handleGetBans());

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
          this._httpsHandler(req, res);
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
