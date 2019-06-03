// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as fs from "fs";
import * as constants from "constants";
const minimumTLSVersion = require("minimum-tls-version");
import { IncomingMessage, ServerResponse } from "http";
import * as https from "https";
import * as SSLConfig from "ssl-config";

import { IServerConfiguration } from "./IServerConfiguration";
import { ILoggerInstance } from "./logger";

const oldCiphers = [
  "ECDHE-ECDSA-CHACHA20-POLY1305",
  "ECDHE-RSA-CHACHA20-POLY1305",
  "ECDHE-RSA-AES128-GCM-SHA256",
  "ECDHE-ECDSA-AES128-GCM-SHA256",
  "ECDHE-RSA-AES256-GCM-SHA384",
  "ECDHE-ECDSA-AES256-GCM-SHA384",
  "DHE-RSA-AES128-GCM-SHA256",
  "DHE-DSS-AES128-GCM-SHA256",
  "kEDH+AESGCM",
  "ECDHE-RSA-AES128-SHA256",
  "ECDHE-ECDSA-AES128-SHA256",
  "ECDHE-RSA-AES128-SHA",
  "ECDHE-ECDSA-AES128-SHA",
  "ECDHE-RSA-AES256-SHA384",
  "ECDHE-ECDSA-AES256-SHA384",
  "ECDHE-RSA-AES256-SHA",
  "ECDHE-ECDSA-AES256-SHA",
  "DHE-RSA-AES128-SHA256",
  "DHE-RSA-AES128-SHA",
  "DHE-DSS-AES128-SHA256",
  "DHE-RSA-AES256-SHA256",
  "DHE-DSS-AES256-SHA",
  "DHE-RSA-AES256-SHA",
  "ECDHE-RSA-DES-CBC3-SHA",
  "ECDHE-ECDSA-DES-CBC3-SHA",
  "EDH-RSA-DES-CBC3-SHA",
  "AES128-GCM-SHA256",
  "AES256-GCM-SHA384",
  "AES128-SHA256",
  "AES256-SHA256",
  "AES128-SHA",
  "AES256-SHA",
  "AES",
  "DES-CBC3-SHA",
  "HIGH",
  "SEED",
  "!aNULL",
  "!eNULL",
  "!EXPORT",
  "!DES",
  "!RC4",
  "!MD5",
  "!PSK",
  "!RSAPSK",
  "!aDH",
  "!aECDH",
  "!EDH-DSS-DES-CBC3-SHA",
  "!KRB5-DES-CBC3-SHA",
  "!SRP",
];

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
      ciphers: oldCiphers.join(":"),
      // honorCipherOrder: true,
      key: fs.readFileSync(configuration.privateKeyFilename),
      rejectUnauthorized: false,
      // # define SSL_MODE_DTLS_SCTP_LABEL_LENGTH_BUG 0x00000400U
      // secureOptions: minimumTLSVersion("sslv3") && 0x00000400,
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
    const httpsServer = https.createServer(
      this._sslOptions(config),
      (req: IncomingMessage, res: ServerResponse) => {
        this._httpsHandler(req, res, config);
      }
    );
    httpsServer.on("newSession", (sessionId, sessionData) => {
      this.logger.warn(`newSession: ${sessionData}`);
    });
    httpsServer.on("clientError", (err, socket) => {
      this.logger.error(`Client error: ${err}`);
      socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
    });
    httpsServer.listen({ port: 443, host: "0.0.0.0" });
  }
}
