import { createServer, IncomingMessage, Server, ServerResponse } from "http";
import { pino } from "pino";
import { EServerConnectionName } from "mcos-types";
import { RoutingMesh } from "mcos-router";
import { ShardServer } from "mcos-shard";
import { PatchServer } from "mcos-patch";

const log = pino();

export class HTTPProxyServer {
  static _instance: HTTPProxyServer;
  _server: Server;
  _serviceName = "MCOServer:HTTPProxy";

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
      log.error("error", `Server error: ${error.message}`, {
        service: this._serviceName,
      });
      log.info("info", `Server shutdown: ${process.exitCode}`, {
        service: this._serviceName,
      });
      process.exit();
    });
  }

  handleRequest(request: IncomingMessage, response: ServerResponse): void {
    log.debug(
      "debug",
      `Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`,
      { service: this._serviceName }
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
    return this._server.listen({ port, host }, () => {
      log.debug("debug", `port ${port} listening`, { service: this._serviceName });
      log.info("info", "Proxy server is listening...", {
        service: this._serviceName,
      });

      // Register service with router
      RoutingMesh.getInstance().registerServiceWithRouter(
        EServerConnectionName.PROXY,
        host,
        port
      );
    });
  }
}
