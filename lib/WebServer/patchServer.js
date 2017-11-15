const app = require("express")();
const bodyParser = require("body-parser");
const http = require("http");
const https = require("https");
const sslConfig = require("ssl-config")("old");
const fs = require("fs");
const configurationFile = require("../../config/config.json");

const logger = require("../../src/logger.js");

const castanetResponse = {
  headers: "'Content-Type', 'application/octet-stream'",
  body: new Buffer("cafebeef00000000000003", "hex"),
};

function patchUpdateInfo() {
  return castanetResponse;
}

function patchNPS() {
  return castanetResponse;
}

function patchMCO() {
  return castanetResponse;
}

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

function start(callback) {
  const config = configurationFile.serverConfig;

  /**
   * Return the shard list
   */
  app.get("/ShardList/", (req, res) => {
    res.set("Content-Type", "text/plain");
    res.send(generateShardList(config));
  });

  /**
   * These 3 methods make up the patch server
   */
  app.post("/games/EA_Seattle/MotorCity/UpdateInfo", (req, res) => {
    const response = patchUpdateInfo(req);
    res.set(response.headers);
    res.send(response.body);
  });

  app.post("/games/EA_Seattle/MotorCity/NPS", (req, res) => {
    const response = patchNPS(req);
    res.set(response.headers);
    res.send(response.body);
  });

  app.post("/games/EA_Seattle/MotorCity/MCO", (req, res) => {
    const response = patchMCO(req);
    res.set(response.headers);
    res.send(response.body);
  });

  /**
   * Fallback if request doesn't match above
   */
  app.use((req, res) => {
    logger.debug("HTTP");
    logger.debug("Headers: ", req.headers);
    logger.debug(`Method: ${req.method}`);
    logger.debug(`Url: ${req.url}`);
    res.send("404");
  });

  const serverPatch = http.createServer(app);
  serverPatch.listen("80", "0.0.0.0", () => {});

  callback(null);
}

module.exports = {
  start,
};
