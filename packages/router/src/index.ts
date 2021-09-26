import { EServerConnectionAction, ServerConnectionRecord } from "mcos-types";
import { Logger } from "@drazisil/mco-logger";
import { RoutingMesh } from "./client";

const { log } = Logger.getInstance();

export class RoutingServer {
  static _instance: RoutingServer;
  private _serverConnections: ServerConnectionRecord[] = [];
  private _serviceName = "MCOServer:Route";

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
    log("debug", `Payload: ${payload}`, {
      service: this._serviceName,
    });

    let payloadJSON: ServerConnectionRecord;

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

  private _registerNewService(payloadJSON: ServerConnectionRecord) {
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
}

export { RoutingMesh };
