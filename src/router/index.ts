import { RoutingMesh } from "./client";
import { logger } from "../logger/index";
import { createServer } from "net";

const log = logger.child({ service: "MCOServer:Route" });

export enum EServerConnectionName {
  ADMIN = "Admin",
  AUTH = "Auth",
  MCSERVER = "MCServer",
  PATCH = "Patch",
  PROXY = "Proxy",
  SHARD = "Shard",
  DATABASE = "Database",
}

export enum EServerConnectionAction {
  REGISTER_SERVICE = "Register Service",
}

export enum EServiceQuery {
  GET_CONNECTIONS = "Get connections",
}

export type ServerConnectionRecord = {
  action?: EServerConnectionAction;
  service: EServerConnectionName;
  host: string;
  port: number;
};

export class RoutingServer {
  static _instance: RoutingServer;
  private _serverConnections: ServerConnectionRecord[] = [];

  static getInstance(): RoutingServer {
    if (!RoutingServer._instance) {
      RoutingServer._instance = new RoutingServer();
    }
    return RoutingServer._instance;
  }

  private constructor() {
    // Intentionally empty
  }

  registerNewService(payloadJSON: ServerConnectionRecord): void {
    const { service, host, port } = payloadJSON;

    if (service && host && port) {
      const newService = {
        service,
        host,
        port,
      };
      this._serverConnections.push(newService);
      log.debug(`Registered new service: ${JSON.stringify(newService)}`);

      return;
    }
    log.error(`There was an error adding server connection: ${payloadJSON}`);
  }

  handleData(data: Buffer): void {
    const payload = data.toString();
    log.debug(`Payload: ${payload}`);

    let payloadJSON: ServerConnectionRecord;

    try {
      payloadJSON = JSON.parse(payload);
    } catch (error) {
      log.error(`Error passing payload!: ${error}`);
      return;
    }

    const { action } = payloadJSON;

    if (action === EServerConnectionAction.REGISTER_SERVICE) {
      return RoutingServer.getInstance().registerNewService(payloadJSON);
    } else {
      throw new Error("Method not implemented.");
    }
  }

  start(this: RoutingServer) {
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
    server.on("connection", (sock) => {
      sock.on("data", this.handleData);
    });
    const port = 4242;
    log.debug(`Attempting to bind to port ${port}`);
    server.listen(port);
  }
}

export { RoutingMesh };
