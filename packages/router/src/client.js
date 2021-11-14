const { pino: P } = require("pino");
const { createConnection } = require("net");
const process = require("process");
const { Buffer } = require("buffer");
const { EServerConnectionAction } = require("./types.js");

const log = P().child({ service: "mcos:RouteClient" });
log.level = process.env["LOG_LEVEL"] || "info";

class RoutingMesh {
  /** @return {RoutingMesh} */
  static getInstance() {
    return new RoutingMesh();
  }

  /** @private */
  constructor() {
    // Intentionally empty
  }

  /**
   *
   * @param {import("./types").EServerConnectionService} service
   * @param {string} host
   * @param {number} port
   */
  registerServiceWithRouter(service, host, port) {
    /** @type {import("./types").ServerConnectionRecord} */
    const payload = {
      action: EServerConnectionAction.REGISTER_SERVICE,
      service,
      host,
      port,
    };
    const payloadBuffer = Buffer.from(JSON.stringify(payload));
    this._sendToRouter(service, payloadBuffer);
  }

  /**
   * @private
   * @param {import("./types").EServerConnectionService} service
   * @param {Buffer} inputBuffer
   */
  _sendToRouter(service, inputBuffer) {
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
module.exports = { RoutingMesh };
