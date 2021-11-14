const { pino: P } = require("pino");
const { createServer } = require("http");
const { RoutingMesh } = require("../../router/src/index.js");
const process = require("process");
const { Buffer } = require("buffer");
const { EServerConnectionService } = require("../../router/src/types.js");

const log = P().child({ service: "mcos:Patch" });
log.level = process.env["LOG_LEVEL"] || "info";

const CastanetResponse = {
  body: Buffer.from("cafebeef00000000000003", "hex"),
  header: {
    type: "Content-Type",
    value: "application/octet-stream",
  },
};

class PatchServer {
  start() {
    const host = "localhost";
    let port = 81;

    if (typeof process.env["LISTEN_PORT"] !== "undefined") {
      port = Number.parseInt(process.env["LISTEN_PORT"]);
    }

    const server = createServer();
    server.on("listening", () => {
      const listeningAddress = server.address();
      if (
        typeof listeningAddress !== "string" &&
        listeningAddress !== null &&
        listeningAddress.port !== undefined
      )
        log.info(`Server is listening on port ${listeningAddress.port}`);
    });
    server.on("request", this.handleRequest);

    log.debug(`Attempting to bind to port ${port}`);
    server.listen(port, host);

    // Register service with router
    RoutingMesh.getInstance().registerServiceWithRouter(
      EServerConnectionService.PATCH,
      host,
      port
    );
  }
  /** @type {PatchServer} */
  static _instance;

  /**
   *
   * @returns {PatchServer}
   */
  static getInstance() {
    if (!PatchServer._instance) {
      PatchServer._instance = new PatchServer();
    }
    return PatchServer._instance;
  }

  /** @private */
  constructor() {
    // Intentionaly empty
  }

  /**
   *
   * @param {import("http").IncomingMessage} request
   * @param {import("http").ServerResponse} response
   */
  handleRequest(request, response) {
    const responseData = CastanetResponse;

    switch (request.url) {
      case "/games/EA_Seattle/MotorCity/UpdateInfo":
      case "/games/EA_Seattle/MotorCity/NPS":
      case "/games/EA_Seattle/MotorCity/MCO":
        log.debug(
          `[PATCH] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`
        );

        response.setHeader(responseData.header.type, responseData.header.value);
        response.end(responseData.body);
        break;

      default:
        response.statusCode = 404;
        response.end("");
        break;
    }
  }
}
module.exports = { CastanetResponse, PatchServer };
