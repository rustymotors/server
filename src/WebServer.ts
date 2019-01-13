// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as fs from "fs";
import { IncomingMessage, ServerResponse } from "http";
import * as https from "https";
// tslint:disable-next-line:no-var-requires
const SSLConfig = require("ssl-config");

import { IServerConfiguration } from "./IServerConfiguration";
import { ILoggerInstance } from "./logger";

export class WebServer {
  public logger: ILoggerInstance;

  constructor(logger: ILoggerInstance) {
    this.logger = logger;
  }
  /**
   * Create the SSL options object
   */
  public _sslOptions(configuration: IServerConfiguration["serverConfig"]) {
    const sslConfig = new SSLConfig("old");
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
    switch (request.url) {
      case "/cert":
        response.setHeader(
          "Content-disposition",
          "attachment; filename=cert.pem"
        );
        response.end(fs.readFileSync(config.certFilename));
        break;

      case "/key":
        response.setHeader(
          "Content-disposition",
          "attachment; filename=pub.key"
        );
        response.end(fs.readFileSync(config.publicKeyFilename).toString("hex"));
        break;
      case "/AuthLogin":
        response.setHeader("Content-Type", "text/plain");
        response.end("Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e");
        break;

      default:
        if (request.url && request.url.startsWith("/AuthLogin?")) {
          response.setHeader("Content-Type", "text/plain");
          response.end("Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e");
          return;
        }
        // Unknown request, log it
        response.statusCode = 404;
        this.logger.debug(
          `[HTTPS] Unknown Request from ${request.socket.remoteAddress} for ${
            request.method
          } ${request.url}`
        );
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
      .listen({ port: 443, host: "0.0.0.0" });
  }
}
