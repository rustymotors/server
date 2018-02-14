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
import { config as configurationFile, IConfigurationFile } from "../../config/config";
import SSLConfig from "../ssl-config";

import { Socket } from "net";
import { logger } from "../../src/logger";

/**
 * Create the SSL options object
 * @param {JSON} config
 */
function sslOptions(config: IConfigurationFile["serverConfig"]) {
  const sslConfig = new SSLConfig();
  return {
    cert: fs.readFileSync(config.certFilename),
    ciphers: sslConfig.ciphers,
    honorCipherOrder: true,
    key: fs.readFileSync(config.privateKeyFilename),
    rejectUnauthorized: false,
    secureOptions: sslConfig.minimumTLSVersion,
  };
}

/**
 * Create the HTTP seb server
 * @param {Function} callback
 */
export function start(callback: () => void) {
  const config = configurationFile.serverConfig;

  // app.use(bodyParser.json()); // support json encoded bodies
  // app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

  // /**
  //  * Return the public vert
  //  */
  // app.get("/key", (req, res) => {
  //   res.setHeader("Content-disposition", "attachment; filename=cert.pem");
  //   res.write(fs.readFileSync(config.publicKeyFilename).toString("hex"));
  //   res.end();
  // });

  // /**
  //  * Return the public key
  //  */
  // app.get("/key", (req, res) => {
  //   res.setHeader("Content-disposition", "attachment; filename=pub.key");
  //   res.write(fs.readFileSync(config.publicKeyFilename).toString("hex"));
  //   res.end();
  // });

  // /**
  //  * This endpoint receives the username and password
  //  */
  // app.get("/AuthLogin", (req, res) => {
  //   res.set("Content-Type", "text/plain");
  //   res.send("Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e");
  // });

  // app.use((req, res) => {
  //   logger.debug("SSL");
  //   logger.debug("Headers: ", req.headers);
  //   logger.debug(`Method: ${req.method}`);
  //   logger.debug(`Url: ${req.url}`);
  //   res.send("404");
  // });

  /**
   * Check if the private key exists
   */
  try {
    fs.accessSync("./data/private_key.pem");
  } catch (error) {
    if (error.code === "ENOENT") {
      logger.error("ERROR: Unable to locate certs. Please run `scripts/make_certs.sh` and try again.");
      process.exit();
    }
  }

  function httpsHandler(request: http.IncomingMessage, response: http.ServerResponse) {
    logger.info(`Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`)
  }

  const httpsServer = https
    .createServer(sslOptions(config), httpsHandler)
    .listen({ port: 443, host: "0.0.0.0"})
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
  callback();
}
