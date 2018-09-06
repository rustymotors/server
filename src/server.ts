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

  public loadConfig(file: string) {
    return yaml.safeLoad(fs.readFileSync(file, "utf8"));
  }

  public async init(thisLogger: ILoggerInstance) {
    this.logger = thisLogger;
    this.config = yaml.safeLoad(fs.readFileSync("./config/config.yml", "utf8"));

    // Get document, or throw exception on error
    this.config = this.loadConfig("./config/config.yml");

    // Start the mock patch server
    const patchServer = new PatchServer(this.logger);
    patchServer.start(this.config);
    thisLogger.info("[webServer] Patch Server started");

    // Start the AuthLogin and shardlist servers
    const webServer = new WebServer(this.logger);
    webServer.start(this.config.serverConfig);
    thisLogger.info("[webServer] Web Server started");

    // Start the MC Server
    const mcServer = new MCServer(this.logger);
    mcServer.startServers(this.config);

    // Start the Admin server
    const adminServer = new AdminServer(mcServer, this.logger);
    adminServer.start(this.config.serverConfig);
    thisLogger.info("[adminServer] Web Server started");
  }
}

const server = new Server();
server.init(logger);
