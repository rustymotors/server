import { EServerConnectionAction, ServerConnectionRecord } from "mcos-types";
import { RoutingMesh } from "./client";
import { pino } from "pino";

const log = pino()

export class RoutingServer {
  static _instance: RoutingServer;
  private _serverConnections: ServerConnectionRecord[] = [];
  serviceName = "MCOServer:Route";

  static getInstance(): RoutingServer {
    if (!RoutingServer._instance) {
      RoutingServer._instance = new RoutingServer();
    }
    return RoutingServer._instance;
  }

  private constructor() {
    // Intentionaly empty
  }
  handleData(data: Buffer): void {
    const payload = data.toString();
    log.debug("debug", `Payload: ${payload}`, {
      service: this.serviceName,
    });

    let payloadJSON: ServerConnectionRecord;

    try {
      payloadJSON = JSON.parse(payload);
    } catch (error) {
      log.error("error", `Error pasing payload!: ${error}`, {
        service: this.serviceName,
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

  private _registerNewService(payloadJSON: ServerConnectionRecord) {
    const { service, host, port } = payloadJSON;

    if (service && host && port) {
      const newService = {
        service,
        host,
        port,
      };
      this._serverConnections.push(newService);
      log.debug("debug", `Registered new service: ${JSON.stringify(newService)}`, {
        service: this.serviceName,
      });

      return;
    }
    log.error(
      "error",
      `There was an error adding server connection: ${payloadJSON}`,
      {
        service: this.serviceName,
      }
    );
  }
}

export { RoutingMesh };
