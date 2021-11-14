const { createServer } = require("http");
const { pino: P } = require("pino");
const { RoutingMesh } = require("../../router/src/index.js");
const { EServerConnectionName } = require("../../router/src/types.js");
const { ShardServer } = require("../../shard/src/index.js");
const { PatchServer } = require("../../patch/src/index.js");

const log = P().child({ service: "mcos:HTTPProxy" });
log.level = process.env["LOG_LEVEL"] || "info";

class HTTPProxyServer {
  /** @type {HTTPProxyServer} */
  static _instance;
  /** @type {Server} */
  _server;

  /**
   *
   * @returns {HTTPProxyServer}
   */
  static getInstance() {
    if (!HTTPProxyServer._instance) {
      HTTPProxyServer._instance = new HTTPProxyServer();
    }
    return HTTPProxyServer._instance;
  }

  /** @private */
  constructor() {
    this._server = createServer((request, response) => {
      this.handleRequest(request, response);
    });

    this._server.on("error", (error) => {
      process.exitCode = -1;
      log.error(`Server error: ${error.message}`);
      log.info(`Server shutdown: ${process.exitCode}`);
      throw new Error("Proxy server quest unexpectedly");
    });
  }

  /**
   *
   * @param {IncomingMessage} request
   * @param {ServerResponse} response
   * @returns
   */
  handleRequest(request, response) {
    log.debug(
      `Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`
    );
    switch (request.url) {
      case "/games/EA_Seattle/MotorCity/UpdateInfo":
      case "/games/EA_Seattle/MotorCity/NPS":
      case "/games/EA_Seattle/MotorCity/MCO":
        return PatchServer.getInstance().handleRequest(request, response);

      default:
        return ShardServer.getInstance()._handleRequest(request, response);
    }
  }

  start() {
    const host = "0.0.0.0";
    const port = 80;
    log.debug(`Attempting to bind to port ${port}`);
    this._server.listen({ port, host }, () => {
      log.debug(`port ${port} listening`);
      log.info("Proxy server is listening...");

      // Register service with router
      RoutingMesh.getInstance().registerServiceWithRouter(
        EServerConnectionName.PROXY,
        host,
        port
      );
    });
  }
}
module.exports = { HTTPProxyServer };
