import { EServerConnectionAction, IServerConnection } from "@mco-server/types";
import { Logger } from "@drazisil/mco-logger";
import { RoutingMesh } from "./client";
import { Server, createServer } from "net";

// eslint-disable-next-line @typescript-eslint/no-var-requires

const { log } = Logger.getInstance();

export class RoutingServer {
  static _instance: RoutingServer;
  private _server: Server;
  private _serverConnections: IServerConnection[] = [];
  private _serviceName = "MCOServer:Route";

  static getInstance(): RoutingServer {
    if (!RoutingServer._instance) {
      RoutingServer._instance = new RoutingServer();
    }
    return RoutingServer._instance;
  }

  private constructor() {
    this._server = createServer((socket) => {
      socket.on("end", () => {
        const { localPort, remoteAddress, remotePort } = socket;

        log(
          "debug",
          `Service ${remoteAddress}:${remotePort} disconnected from port ${localPort}`,
          {
            service: this._serviceName,
          }
        );
      });
      socket.on("data", (data) => {
        this._handleData(data);
      });
      socket.on("error", (error) => {
        if (!error.message.includes("ECONNRESET")) {
          throw new Error(`Socket error: ${error}`);
        }
      });
    });
  }
  private _handleData(data: Buffer): void {
    const payload = data.toString();
    log("debug", `Payload: ${payload}`, {
      service: this._serviceName,
    });

    let payloadJSON: IServerConnection;

    try {
      payloadJSON = JSON.parse(payload);
    } catch (error) {
      log("error", `Error pasing payload!: ${error}`, {
        service: this._serviceName,
      });
      return;
    }

    const { action } = payloadJSON;

    if (action === EServerConnectionAction.REGISTER_SERVICE) {
      return this._registerNewService(payloadJSON);
    } else {
      throw new Error("Method not implemented.");
    }
  }

  private _registerNewService(payloadJSON: IServerConnection) {
    const { service, host, port } = payloadJSON;

    if (service && host && port) {
      const newService = {
        service,
        host,
        port,
      };
      this._serverConnections.push(newService);
      log("debug", `Registered new service: ${JSON.stringify(newService)}`, {
        service: this._serviceName,
      });

      return;
    }
    log(
      "error",
      `There was an error adding server connection: ${payloadJSON}`,
      {
        service: this._serviceName,
      }
    );
  }

  async start(): Promise<Server> {
    const port = 4242;
    this._server.listen(port, "0.0.0.0", () => {
      log("info", `RoutingServer listening on port ${port}`, {
        service: this._serviceName,
      });
    });
    return this._server;
  }
}

export { RoutingMesh };
