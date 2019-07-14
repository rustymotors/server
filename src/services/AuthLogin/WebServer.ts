// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as fs from "fs";
import * as yaml from "js-yaml";
import { IncomingMessage, ServerResponse } from "http";
import { ILoggers } from "../shared/logger";
import * as https from "https";

import { IServerConfiguration } from "../shared/interfaces/IServerConfiguration";

const CONFIG: IServerConfiguration = yaml.safeLoad(
  fs.readFileSync("./src/services/shared/config.yml", "utf8")
);

const { serverConfig } = CONFIG;

export class WebServer {
  public config: IServerConfiguration;
  public loggers: ILoggers;

  constructor(config: IServerConfiguration, loggers: ILoggers) {
    this.config = config;
    this.loggers = loggers;
  }

  _sslOptions(configuration: IServerConfiguration["serverConfig"]) {
    return {
      cert: fs.readFileSync(configuration.certFilename),
      honorCipherOrder: true,
      key: fs.readFileSync(configuration.privateKeyFilename),
      rejectUnauthorized: false,
    };
  }

  public _handleGetTicket(ticket: string) {
    return "Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e";
  }

  public _handleGetCert() {
    return fs.readFileSync(serverConfig.certFilename);
  }

  public _handleGetKey() {
    return fs.readFileSync(serverConfig.publicKeyFilename);
  }

  public _handleGetRegistry() {
    return fs.readFileSync(serverConfig.registryFilename);
  }

  public _httpsHandler(request: IncomingMessage, response: ServerResponse) {
    this.loggers.both.info(
      `[Web] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`
    );
    if (request.url!.startsWith("/AuthLogin")) {
      response.setHeader("Content-Type", "text/plain");
      return response.end(this._handleGetTicket(request.url!));
    }

    if (request.url === "/cert") {
      response.setHeader(
        "Content-disposition",
        "attachment; filename=cert.pem"
      );
      return response.end(this._handleGetCert());
    }

    if (request.url === "/key") {
      response.setHeader("Content-disposition", "attachment; filename=key.pub");
      return response.end(this._handleGetKey());
    }

    if (request.url === "/registry") {
      response.setHeader("Content-disposition", "attachment; filename=mco.reg");
      return response.end(this._handleGetRegistry());
    }

    if (request.url === "/registry") {
      return response.end("Hello, world!");
    }

    this.loggers.both.debug(`Unknown Request`);
    return response.end("Unknown request.");
  }

  async start() {
    const httpsServer = https
      .createServer(
        this._sslOptions(this.config.serverConfig),
        (req: IncomingMessage, res: ServerResponse) => {
          this._httpsHandler(req, res);
        }
      )
      .listen({ port: 443, host: "0.0.0.0" });
  }
}
