import { Server, Socket, SocketAddress } from "net";
import type P from "pino";
import { createServer } from "net";
import { httpListener } from "../../src/server/httpListener.js";
import * as http from "http";

export interface ICoreConfig {
  logger?: P.Logger;
  externalHost: string;
  ports?: number[];
}
/**
 * Primany server class
 *
 * @export
 * @class MCOServer
 */
export class MCOServer {
  private _config: ICoreConfig;
  private _log: P.Logger;
  private _running = false;
  private _listeningServers: Server[] = [];
/**
 * Handle http socket connections
 *
 * @private
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {P.Logger} log
 * @memberof MCOServer
 */
private _httpListener(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    log: P.Logger
  ) {
    log.debug(`url: ${req.url}`);
  }
  /**
   * Handle incomming socket connections
   *
   * @private
   * @param {Socket} incomingSocket
   * @param {P.Logger} log
   * @return {void}
   * @memberof MCOServer
   */
  private _listener(incomingSocket: Socket, log: P.Logger): void {
    log.debug(
      `Connection from ${incomingSocket.remoteAddress} on port ${incomingSocket.localPort}`
    );

    // Is this an http request?
    if (incomingSocket.localPort === 80) {
      log.debug("Web request");
      const newServer = new http.Server(httpListener);
      // Send the socket to the http server instance
      void newServer.emit("connection", incomingSocket);
      return;
    }

    // This is a 'normal' TCP socket
    incomingSocket.on("end", () => {
      // log.info(`Client ${remoteAddress} disconnected from port ${localPort}`);
    });
    incomingSocket.on("data", (data: Buffer) => {
      // TODO: Process socket data
      this._log.debug(`Recieved some data: ${data.toString("hex")}`);
    });
  }
  /**
   * Is the server in a running state?
   *
   * @readonly
   * @type {boolean}
   * @memberof MCOServer
   */
  get isRunning(): boolean {
    return this._running;
  }

  private constructor(config: ICoreConfig) {
    this._config = config;
    if (!this._config.logger) {
      throw new Error("Logger was not passed in the config");
    }
    this._log = this._config.logger.child({ service: "mcos:core" });
  }
  /**
   * Get an instance of the primary server
   *
   * @static
   * @param {ICoreConfig} config
   * @return {MCOServer}
   * @memberof MCOServer
   */
  public static init(config: ICoreConfig): MCOServer {
    return new MCOServer(config);
  }
  /**
   * Start port listeners and ,move server to running state
   *
   * @memberof MCOServer
   */
  public run(): void {
    this._log.info("Server starting");

    if (typeof this._config.ports === "undefined") {
      throw new Error("No listening ports were passed");
    }

    for (let index = 0; index < this._config.ports.length; index++) {
      const port = this._config.ports[index];
      const newServer = createServer((s: Socket) => {
        return this._listener(s, this._log);
      });
      newServer.on("error", (err) => {
        throw err;
      });
      newServer.listen(port, "0.0.0.0", 0, () => {
        this._log.debug(`Listening on port ${port}`);
        this._listeningServers.push(newServer);
      });
    }

    this._running = true;
  }
  /**
   * Close all listening ports and move server to stopped state
   *
   * @memberof MCOServer
   */
  public stop(): void {
    this._running = false;
    this._log.debug(
      `There are ${this._listeningServers.length} servers listening`
    );
    for (let index = 0; index < this._listeningServers.length; index++) {
      const server = this._listeningServers[index];

      if (typeof server === "undefined") {
        break;
      }

      this._log.debug(`Server ${index} is listening: ${server.listening}`);
      const addressInfo = server.address();

      if (addressInfo instanceof SocketAddress) {
        this._log.debug(`Closing port ${addressInfo.port}`);
      } else {
        this._log.debug(`server address is ${addressInfo}`);
      }

      server.close();
    }
    this._log.info("Servers closed");
  }
}
