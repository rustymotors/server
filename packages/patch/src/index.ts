import P from "pino";
import { IncomingMessage, ServerResponse } from "http";

const log = P().child({ service: "MCOServer:Patch" });
log.level = process.env.LOG_LEVEL || "info";

export const CastanetResponse = {
  body: Buffer.from("cafebeef00000000000003", "hex"),
  header: {
    type: "Content-Type",
    value: "application/octet-stream",
  },
};

export class PatchServer {
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
