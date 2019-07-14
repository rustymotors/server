import * as fs from "fs";
import { AdminServer } from "./AdminServer";
import { IServerConfiguration } from "./services/shared/interfaces/IServerConfiguration";
import { ILoggerInstance, Logger, ILoggers } from "./services/shared/logger";
import { MCServer } from "./services/MCServer/MCServer";

export class Server {
  public config: IServerConfiguration;
  public logger: ILoggerInstance;
  public loggers: ILoggers;

  public constructor(config: IServerConfiguration, loggers: ILoggers) {
    this.loggers = loggers;
    this.logger = loggers.both;
    this.config = config;

    this.start();
  }

  private async start() {
    this.logger.info("Starting servers...");

    // Start the MC Server
    const mcServer = new MCServer(this.loggers);
    await mcServer.startServers(this.config);

    // Start the Admin server
    const adminServer = new AdminServer(mcServer, this.logger);
    adminServer.start(this.config.serverConfig);
    this.logger.debug("[adminServer] Web Server started");

    this.logger.info("Servers started, ready for connections.");
  }
}
