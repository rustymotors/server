import P from "pino";
import {
  EServerConnectionAction,
  EServerConnectionName,
  ServerConnectionRecord,
} from "./index";
import { createConnection } from "net";

const log = P().child({ service: "MCOServer:RouteClient" });
log.level = process.env["LOG_LEVEL"] || "info";

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
    client.on("data", (data) => {
      console.log(data.toString());
      client.end();
    });
    client.on("end", () => {
      log.info(`Disconnected from RoutingServer: ${service}`);
    });
  }
}
