import { RoutingMesh } from "./client";
import P from "pino";
import { createServer } from "net";
import process from "process";


const log = P().child({ service: "MCOServer:Route" });
log.level = process.env["LOG_LEVEL"] || "info";

/** 
 * @exports
 * @enum {string}
 */
export const EServerConnectionName = {
  ADMIN: "Admin",
  AUTH: "Auth",
  MCSERVER: "MCServer",
  PATCH: "Patch",
  PROXY: "Proxy",
  SHARD: "Shard",
  DATABASE: "Database",
}

/**
 * @exports
 * @enum {string}
 */
export const EServerConnectionAction = {
  REGISTER_SERVICE: "Register Service",
}

/**
 * @exports
 * @enum {string}
 */
export const EServiceQuery = {
  GET_CONNECTIONS: "Get connections",
}

/**
 * @export
 * @typedef {Object} ServerConnectionRecord
 * @property {typeof EServerConnectionAction} [action]
 * @property {typeof EServerConnectionName} name
 * @property {string} host
 * @property {number} port
 */


export class RoutingServer {
  /** @type {RoutingServer} */
  static _instance;
  /**
   * @private
   * @type {ServerConnectionRecord[]}
   */
  _serverConnections = [];

  /**
   * 
   * @returns {RoutingServer}
   */
  static getInstance() {
    if (!RoutingServer._instance) {
      RoutingServer._instance = new RoutingServer();
    }
    return RoutingServer._instance;
  }

  /** @private */
  constructor() {
    // Intentionally empty
  }

  /**
   * 
   * @param {ServerConnectionRecord} payloadJSON 
   * @returns {void}
   */
  registerNewService(payloadJSON) {
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

  /**
   * 
   * @param {Buffer} data 
   * @returns {void}
   */
  handleData(data) {
    const payload = data.toString();
    log.debug(`Payload: ${payload}`);

    /** @type {ServerConnectionRecord} */
    let payloadJSON;

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

  start() {
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
