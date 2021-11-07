import { createServer, IncomingMessage, Server, ServerResponse } from "http";
import P from "pino";
import { EServerConnectionName, RoutingMesh } from "../../router/src/index";
import { ShardServer } from "../../shard/src/index";
import { PatchServer } from "../../patch/src/index";

const log = P().child({ service: "MCOServer:HTTPProxy" });
log.level = process.env["LOG_LEVEL"] || "info";

export class HTTPProxyServer {
  static _instance: HTTPProxyServer;
  _server: Server;

  static getInstance(): HTTPProxyServer {
    if (!HTTPProxyServer._instance) {
      HTTPProxyServer._instance = new HTTPProxyServer();
    }
    return HTTPProxyServer._instance;
  }

  private constructor() {
    this._server = createServer((request, response) => {
      this.handleRequest(request, response);
    });

    this._server.on("error", (error) => {
      process.exitCode = -1;
      log.error(`Server error: ${error.message}`);
      log.info(`Server shutdown: ${process.exitCode}`);
      process.exit();
    });
  }

  handleRequest(request: IncomingMessage, response: ServerResponse): void {
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

  start(): Server {
    const host = "0.0.0.0";
    const port = 80;
    log.debug(`Attempting to bind to port ${port}`);
    return this._server.listen({ port, host }, () => {
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
