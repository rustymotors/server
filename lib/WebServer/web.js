const app = require("express")();
const bodyParser = require("body-parser");
const http = require("http");
const https = require("https");
const sslConfig = require("ssl-config")("old");
const fs = require("fs");
const configurationFile = require("../../config/config.json");

const logger = require("../../src/logger.js");

function generateShardList(config) {
  return `[The Clocktower]
  Description=The Clocktower
  ShardId=44
  LoginServerIP=${config.ipServer}
  LoginServerPort=8226
  LobbyServerIP=${config.ipServer}
  LobbyServerPort=7003
  MCOTSServerIP=${config.ipServer}
  StatusId=0
  Status_Reason=
  ServerGroup_Name=Group - 1
  Population=88
  MaxPersonasPerUser=2
  DiagnosticServerHost=${config.ipServer}
  DiagnosticServerPort=80`;
}

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

function start(callback) {
  const config = configurationFile.serverConfig;
  app.get("/ShardList/", (req, res) => {
    res.set("Content-Type", "text/plain");
    res.send(generateShardList(config));
  });

  app.get("/key", (req, res) => {
    res.setHeader("Content-disposition", "attachment; filename=pub.key");
    res.write(fs.readFileSync(config.publicKeyFilename).toString("hex"));
    res.end();
  });

  app.use(bodyParser.json()); // support json encoded bodies
  app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

  app.get("/AuthLogin", (req, res) => {
    res.set("Content-Type", "text/plain");
    res.send("Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e");
  });

  app.use((req, res) => {
    logger.debug(`Headers: ${req.headers}`);
    logger.debug(`Method: ${req.method}`);
    logger.debug(`Url: ${req.url}`);
    res.send("404");
  });

  const httpsServer = https
    .createServer(sslOptions(config), app)
    .listen("443", "0.0.0.0", () => {
      logger.info(`AuthLogin server listening on port ${app.get("port_ssl")}`);
    });
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
