import P from "pino";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { RoutingMesh, EServerConnectionName } from "../../router/src/index";

const log = P().child({ service: "MCOServer:Patch" });
log.level = process.env["LOG_LEVEL"] || "info";

export const CastanetResponse = {
  body: Buffer.from("cafebeef00000000000003", "hex"),
  header: {
    type: "Content-Type",
    value: "application/octet-stream",
  },
};

export class PatchServer {
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
      EServerConnectionName.PATCH,
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
   * @param {IncomingMessage} request 
   * @param {ServerResponse} response 
   */
  handleRequest(
    request,
    response
  ) {
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
