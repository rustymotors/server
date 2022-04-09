import { logger } from "../logger/index.js";
import { createServer, IncomingMessage, ServerResponse } from "http";
import type { AppConfiguration } from "../config/appconfig.js";

const log = logger.child({ service: "MCOServer:Patch" });

export const CastanetResponse = {
  body: Buffer.from("cafebeef00000000000003", "hex"),
  header: {
    type: "Content-Type",
    value: "application/octet-stream",
  },
};

/**
 * The PatchServer class handles HTTP requests from the client for patching and upgrades
 * @class
 */
export class PatchServer {
  /**
   * Starts the HTTP listener
   */
  start(this: PatchServer): void {
    if (!this.config.MCOS.SETTINGS.PATCH_LISTEN_HOST) {
      throw new Error("Please set MCOS__SETTINGS__PATCH_LISTEN_HOST");
    }
    const host = this.config.MCOS.SETTINGS.PATCH_LISTEN_HOST;
    const port = 80;

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
    server.on("request", this.handleRequest.bind(this));

    log.debug(`Attempting to bind to port ${port}`);
    server.listen(port, host);
  }
  static _instance: PatchServer;
  config: AppConfiguration;

  /**
   * Return the instance of the PatchServer class
   * @returns {PatchServer}
   */
  static getInstance(config: AppConfiguration): PatchServer {
    if (!PatchServer._instance) {
      PatchServer._instance = new PatchServer(config);
    }
    return PatchServer._instance;
  }

  private constructor(config: AppConfiguration) {
    this.config = config;
  }

  /**
   * Returns the hard-coded value that tells the client there are no updates or patches
   * @param {IncomingMessage} request
   * @param {ServerResponse} response
   * @returns {ServerResponse}
   */
  castanetResponse(
    request: IncomingMessage,
    response: ServerResponse
  ): ServerResponse {
    log.debug(
      `[PATCH] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`
    );

    response.setHeader(
      CastanetResponse.header.type,
      CastanetResponse.header.value
    );
    return response.end(CastanetResponse.body);
  }

  /**
   * Routes incomming HTTP requests
   * @param {IncomingMessage} request
   * @param {ServerResponse} response
   * @returns {ServerResponse}
   */
  handleRequest(
    this: PatchServer,
    request: IncomingMessage,
    response: ServerResponse
  ): ServerResponse {
    if (
      request.url === "/games/EA_Seattle/MotorCity/UpdateInfo" ||
      request.url === "/games/EA_Seattle/MotorCity/NPS" ||
      request.url === "/games/EA_Seattle/MotorCity/MCO"
    ) {
      return this.castanetResponse(request, response);
    }
    response.statusCode = 404;
    return response.end("");
  }
}
