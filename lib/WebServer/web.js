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

const app = require("express")();
const bodyParser = require("body-parser");
const http = require("http");
const https = require("https");
const sslConfig = require("ssl-config")("old");
const fs = require("fs");
const configurationFile = require("../../config/config.json");

const logger = require("../../src/logger.js");

/**
 * Create the SSL options object
 * @param {JSON} config 
 */
function sslOptions(config) {
  return {
    key: fs.readFileSync(config.privateKeyFilename),
    cert: fs.readFileSync(config.certFilename),
    rejectUnauthorized: false,
    ciphers: sslConfig.ciphers,
    honorCipherOrder: true,
    secureOptions: sslConfig.minimumTLSVersion,
  };
}

/**
 * Create the HTTP seb server
 * @param {Function} callback 
 */
function start(callback) {
  const config = configurationFile.serverConfig;

  app.use(bodyParser.json()); // support json encoded bodies
  app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

  /**
   * Return the public key
   */
  app.get("/key", (req, res) => {
    res.setHeader("Content-disposition", "attachment; filename=pub.key");
    res.write(fs.readFileSync(config.publicKeyFilename).toString("hex"));
    res.end();
  });

  /**
   * This endpoint receives the username and password
   */
  app.get("/AuthLogin", (req, res) => {
    res.set("Content-Type", "text/plain");
    res.send("Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e");
  });

  app.use((req, res) => {
    logger.debug("SSL");
    logger.debug("Headers: ", req.headers);
    logger.debug(`Method: ${req.method}`);
    logger.debug(`Url: ${req.url}`);
    res.send("404");
  });

  /**
 * Check if the private key exists
 */
  try {
    fs.accessSync("./data/private_key.pem");
  } catch (error) {
    if (error.code == "ENOENT") {
      logger.error(
        "ERROR: Unable to locate certs. Please run `scripts/make_certs.sh` and try again."
      );
      process.exit();
    }
  }

  const httpsServer = https
    .createServer(sslOptions(config), app)
    .listen("443", "0.0.0.0", () => {});
  httpsServer.on("connection", socket => {
    logger.info("New SSL connection");
    socket.on("error", error => {
      logger.error(`SSL Socket Error: ${error.message}`);
    });
    socket.on("close", () => {
      logger.info("SSL Socket Connection closed");
    });
  });

  httpsServer.on("tlsClientError", err => {
    logger.error(`tlsClientError: ${err}`);
  });
  callback(null);
}

module.exports = {
  start,
};
