import * as fs from "fs";
import { AdminServer } from "./AdminServer";
import { IServerConfiguration } from "./services/shared/interfaces/IServerConfiguration";
import * as bunyan from "bunyan";
import { MCServer } from "./services/MCServer/MCServer";

export class Server {
  public config: IServerConfiguration;
  public logger: bunyan;

  public constructor(config: IServerConfiguration) {
    this.logger = bunyan
      .createLogger({ name: "mcoServer" })
      .child({ module: "server" });
    this.config = config;

    this.start();
  }

  private async start() {
    this.logger.info("Starting servers...");

    // Start the MC Server
    const mcServer = new MCServer();
    await mcServer.startServers(this.config);

    // Start the Admin server
    const adminServer = new AdminServer(mcServer);
    adminServer.start(this.config.serverConfig);
    this.logger.debug("[adminServer] Web Server started");

    this.logger.info("Servers started, ready for connections.");
  }
}
