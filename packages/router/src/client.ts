import { pino } from "pino";
import {
  EServerConnectionAction,
  EServerConnectionName,
  ServerConnectionRecord,
} from "mcos-types";
import { createConnection } from "net";

const log = pino();

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
    const client = createConnection({ port: 4242 }, () => {
      // 'connect' listener.
      log.debug("debug", "Connected to RoutingServer", {
        service,
      });
      client.end(inputBuffer);
    });
    client.on("data", (data) => {
      console.log(data.toString());
      client.end();
    });
    client.on("end", () => {
      log.info("info", "disconnected from RoutingServer", {
        service,
      });
    });
  }
}
