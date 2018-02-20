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

import fs = require("fs");
import * as http from "http";
import * as https from "https";
import { config, IConfigurationFile } from "../../config/config";
import SSLConfig from "../ssl-config";

import { Socket } from "net";
import { logger } from "../../src/logger";

/**
 * Create the SSL options object
 */
function sslOptions(configuration: IConfigurationFile["serverConfig"]) {
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

function httpsHandler(request: http.IncomingMessage, response: http.ServerResponse) {
  logger.info(`Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`)
  switch (request.url) {
    case "/key":
      response.setHeader("Content-disposition", "attachment; filename=cert.pem");
      response.end(fs.readFileSync(config.serverConfig.publicKeyFilename).toString("hex"));
      break;
    case "/AuthLogin":
      response.setHeader("Content-Type", "text/plain")
      response.end("Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e");
      break;


    default:
      response.statusCode = 404;
      response.end("Unknown request.")
      break;
  }
}

export default class WebServer {

  public async start() {

    const httpsServer = https
      .createServer(sslOptions(config.serverConfig), httpsHandler)
      .listen({ port: 443, host: "0.0.0.0" })
      .on("connection", (socket: Socket) => {
        // logger.info("New SSL connection");
        socket.on("error", (error: NodeJS.ErrnoException) => {
          logger.error(`SSL Socket Error: ${error.message}`);
        });
        socket.on("close", () => {
          // logger.info("SSL Socket Connection closed");
        });
      })
      .on("tlsClientError", (err: Error) => {
        logger.error(`tlsClientError: ${err}`);
      });

  }
}
