import { logger } from "../logger/index";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { RoutingMesh, EServerConnectionName } from "../router";
import config from "../config/appconfig";

const log = logger.child({ service: "MCOServer:Patch" });

export const CastanetResponse = {
  body: Buffer.from("cafebeef00000000000003", "hex"),
  header: {
    type: "Content-Type",
    value: "application/octet-stream",
  },
};

export class PatchServer {
  start(this: PatchServer) {
    if (!config.MCOS.SETTINGS.PATCH_LISTEN_HOST) {
      throw new Error("Please set MCOS__SETTINGS__PATCH_LISTEN_HOST");
    }
    const host = config.MCOS.SETTINGS.PATCH_LISTEN_HOST;
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

    // Register service with router
    RoutingMesh.getInstance().registerServiceWithRouter(
      EServerConnectionName.PATCH,
      host,
      port
    );
  }
  static _instance: PatchServer;

  static getInstance(): PatchServer {
    if (!PatchServer._instance) {
      PatchServer._instance = new PatchServer();
    }
    return PatchServer._instance;
  }

  private constructor() {
    // Intentionaly empty
  }

  handleRequest(
    this: PatchServer,
    request: IncomingMessage,
    response: ServerResponse
  ): void {
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
