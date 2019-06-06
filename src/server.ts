import * as fs from "fs";
import * as yaml from "js-yaml";
import { AdminServer } from "./AdminServer";
import { IServerConfiguration } from "../services/shared/interfaces/IServerConfiguration";
import { ILoggerInstance, Logger } from "../services/shared/logger";
import { MCServer } from "./MCServer";

import * as dotenvSafe from "dotenv-safe";
dotenvSafe.config();

const logger = new Logger().getLogger();

export class Server {
  public config: IServerConfiguration;
  public logger: ILoggerInstance;

  public constructor(thisLogger: ILoggerInstance) {
    this.logger = thisLogger;

    // Get document, or throw exception on error
    this.config = this.loadConfig("./services/shared/config.yml");

    if (process.env.SERVER_IP) {
      this.config.serverConfig.ipServer = process.env.SERVER_IP;
    }

    this.start();
  }
  public loadConfig(file: string) {
    return yaml.safeLoad(fs.readFileSync(file, "utf8"));
  }
  private async start() {
    this.logger.info("Starting servers...");

    // Start the MC Server
    const mcServer = new MCServer(this.logger);
    await mcServer.startServers(this.config);

    // Start the Admin server
    const adminServer = new AdminServer(mcServer, this.logger);
    adminServer.start(this.config.serverConfig);
    this.logger.debug("[adminServer] Web Server started");

    this.logger.info("Servers started, ready for connections.");
  }
}

const server = new Server(logger);
