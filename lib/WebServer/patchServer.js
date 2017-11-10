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

module.exports = {
  patchMCO,
  patchNPS,
  patchUpdateInfo,
};

function start(callback) {
  const config = configurationFile.serverConfig;
  app.post("/games/EA_Seattle/MotorCity/UpdateInfo", (req, res) => {
    const response = patchServer.patchUpdateInfo(req);
    res.set(response.headers);
    res.send(response.body);
  });

  app.post("/games/EA_Seattle/MotorCity/NPS", (req, res) => {
    const response = patchServer.patchNPS(req);
    res.set(response.headers);
    res.send(response.body);
  });

  app.post("/games/EA_Seattle/MotorCity/MCO", (req, res) => {
    const response = patchServer.patchMCO(req);
    res.set(response.headers);
    res.send(response.body);
  });

  app.use((req, res) => {
    logger.debug(`Headers: ${req.headers}`);
    logger.debug(`Method: ${req.method}`);
    logger.debug(`Url: ${req.url}`);
    res.send("404");
  });

  const serverPatch = http.createServer(app);
  serverPatch.listen("80", "0.0.0.0", () => {
    logger.info(`Patch server listening on port ${app.get("port")}`);
  });

  callback(null);
}

module.exports = {
  start,
};
