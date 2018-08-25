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

const fs = require("fs");
const https = require("https");
const SSLConfig = require("ssl-config");

const { logger } = require("../logger");

/**
 * Create the SSL options object
 */
function sslOptions(configuration) {
  const sslConfig = SSLConfig("old");
  return {
    cert: fs.readFileSync(configuration.certFilename),
    ciphers: sslConfig.ciphers,
    honorCipherOrder: true,
    key: fs.readFileSync(configuration.privateKeyFilename),
    rejectUnauthorized: false,
    secureOptions: sslConfig.minimumTLSVersion,
  };
}

function httpsHandler(
  request,
  response
) {
  logger.info(
    `[HTTPS] Request from ${request.socket.remoteAddress} for ${
    request.method
    } ${request.url}`
  );
  switch (request.url) {
    case "/cert":
      response.setHeader(
        "Content-disposition",
        "attachment; filename=cert.pem"
      );
      response.end(fs.readFileSync(config.serverConfig.certFilename));
      break;

    case "/key":
      response.setHeader("Content-disposition", "attachment; filename=pub.key");
      response.end(
        fs.readFileSync(config.serverConfig.publicKeyFilename).toString("hex")
      );
      break;
    case "/AuthLogin":
      response.setHeader("Content-Type", "text/plain");
      response.end("Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e");
      break;

    default:
      if (request.url.startsWith("/AuthLogin?")) {
        response.setHeader("Content-Type", "text/plain");
        response.end("Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e");
        return;
      }
      response.statusCode = 404;
      response.end("Unknown request.");
      break;
  }
}

class WebServer {
  async start(config) {
    const httpsServer = https
      .createServer(sslOptions(config.serverConfig), httpsHandler)
      .listen({ port: 4443, host: "0.0.0.0" })
      .on("connection", (socket) => {
        socket.on("error", (error) => {
          logger.error(`[webServer] SSL Socket Error: ${error.message}`);
        });
        socket.on("close", () => {
          logger.info("[webServer] SSL Socket Connection closed");
        });
      })
      .on("tlsClientError", (err) => {
        logger.error(`[webServer] tlsClientError: ${err}`);
      });
  }
}

module.exports = { WebServer }