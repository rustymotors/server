import fs = require("fs");
import yaml = require("js-yaml");
import { AdminServer } from "./AdminServer";
import { IServerConfiguration } from "./IServerConfiguration";
import { ILoggerInstance, Logger } from "./logger";
import { MCServer } from "./MCServer";
import { PatchServer } from "./patchServer";
import { WebServer } from "./WebServer";

const logger = new Logger().getLogger();

export class Server {
  public config: IServerConfiguration;
  public logger: ILoggerInstance;

  public constructor(thisLogger: ILoggerInstance) {
    this.logger = thisLogger;
    this.config = yaml.safeLoad(fs.readFileSync("./config/config.yml", "utf8"));

    // Get document, or throw exception on error
    this.config = this.loadConfig("./config/config.yml");

    this.start();
  }
  public loadConfig(file: string) {
    return yaml.safeLoad(fs.readFileSync(file, "utf8"));
  }
  private async start() {
    this.logger.info("Starting servers...");

    // Start the mock patch server
    const patchServer = new PatchServer(this.logger);
    await patchServer.start(this.config);
    this.logger.debug("[webServer] Patch Server started");

    // Start the AuthLogin and shardlist servers
    const webServer = new WebServer(this.logger);
    webServer.start(this.config.serverConfig);
    this.logger.debug("[webServer] Web Server started");

    // Start the MC Server
    const mcServer = new MCServer(this.logger);
    await mcServer.startServers(this.config);

    // Start the Admin server
    const adminServer = new AdminServer(patchServer, mcServer, this.logger);
    adminServer.start(this.config.serverConfig);
    this.logger.debug("[adminServer] Web Server started");

    this.logger.info("Servers started, ready for connections.");
  }
}

const server = new Server(logger);
