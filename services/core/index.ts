import { createServer, Server, Socket } from "net";
import P from "pino";

export interface ICoreConfig {
  logger?: P.Logger;
  externalHost: string;
  ports?: number[];
}

export class MCOServer {
  private _config: ICoreConfig = {
    externalHost: "0.0.0.0",
  };
  private _log: P.Logger;
  private _running = false;
  private listeningServers: Server[] = [];

  private _listener(incomingSocket: Socket) {
    this._log.debug(`Connection from ${incomingSocket.remoteAddress}`);
    incomingSocket.on("end", () => {
      // log.info(`Client ${remoteAddress} disconnected from port ${localPort}`);
    });
    incomingSocket.on("data", (data) => {
      console.log(data);

      // void this._onData(data, connectionRecord);
    });
  }

  private constructor(config: ICoreConfig) {
    this._config = config;
    if (!this._config.logger) {
      throw new Error("Logger was not passed in the config");
    }
    this._log = this._config.logger.child({ service: "mcos:core" });

    if (
      this._config.ports?.length === 0 ||
      typeof this._config.ports === "undefined"
    ) {
      throw new Error("No listening ports were passed");
    }
  }

  public static init(config: ICoreConfig) {
    return new MCOServer(config);
  }

  public run() {
    this._log.info("Server starting");

    this._config.ports?.forEach((port) => {
      const newServer = createServer(this._listener).listen({
        port: port,
        host: "0.0.0.0",
      });
      this._log.debug(`Listening on port ${port}`);
      this.listeningServers.push(newServer);
    });

    this._running = true;
    while (this._running === true) {
    //   console.log(this.listeningServers[0].listening);
    }
    this._log.info("Server exiting");
  }

  public stop() {
    this._running = false;
    this.listeningServers.forEach((server) => {
      server.close();
    });
  }
}
