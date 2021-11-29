import { logger } from "../logger/index";
import {
  EServerConnectionAction,
  EServerConnectionName,
  ServerConnectionRecord,
} from "./index";
import { createConnection } from "net";

const log = logger.child({ service: "MCOServer:RouteClient" });

export class RoutingMesh {
  static getInstance(): RoutingMesh {
    return new RoutingMesh();
  }

  private constructor() {
    // Inrnetionally empty
  }

  registerServiceWithRouter(
    service: EServerConnectionName,
    host: string,
    port: number
  ): void {
    const payload: ServerConnectionRecord = {
      action: EServerConnectionAction.REGISTER_SERVICE,
      service,
      host,
      port,
    };
    const payloadBuffer = Buffer.from(JSON.stringify(payload));
    this._sendToRouter(service, payloadBuffer);
  }

  private _sendToRouter(
    service: EServerConnectionName,
    inputBuffer: Buffer
  ): void {
    const client = createConnection({ host: "localhost", port: 4242 }, () => {
      // 'connect' listener.
      log.debug(`Connected to RoutingServer: ${service}`);
      client.end(inputBuffer);
    });
    client.on("data", () => {
      client.end();
    });
    client.on("end", () => {
      log.info(`Disconnected from RoutingServer: ${service}`);
    });
  }
}
