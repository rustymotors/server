import { Server, Socket  } from "net";
import type P from "pino";
import { createServer } from "net";
import { httpListener } from "../../src/server/httpListener.js";
import * as http from "http";
import { ListenerThread } from "../../src/core/listener-thread.js";
import { ConnectionManager } from "../../src/core/connection-mgr.js";
import { EventEmitter } from "events";

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
export class MCOServer extends EventEmitter {
  private _config: ICoreConfig;
  private _log: P.Logger;
  private _running = false;
  private _listeningServers: Server[] = [];

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
    void ListenerThread.getInstance().tcpListener(incomingSocket, ConnectionManager.getConnectionManager());
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
/**
 * Get the number of listening servers
 *
 * @readonly
 * @memberof MCOServer
 */
get serverCount() {
    return this._listeningServers.length
  }

  private constructor(config: ICoreConfig) {
    super()
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
        this._listener(s, this._log);
        return
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
    this.emit('started', this)
  }
  /**
   * Close all listening ports and move server to stopped state
   *
   * @memberof MCOServer
   */
  public stop(): void {
    this._running = false;
    this._log.debug(
      `There are ${this.serverCount} servers listening`
    );
    
    for (let index = 0; index < this._listeningServers.length; index++) {
      const server = this._listeningServers[index];
      server.emit("close", this)
    }
    this._listeningServers = []
    this._log.info("Servers closed");
    this.emit('stopped')
  }
}
