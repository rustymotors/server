import * as fs from "fs";
import * as yaml from "js-yaml";
import { AdminServer } from "./AdminServer";
import { IServerConfiguration } from "./IServerConfiguration";
import { ILoggerInstance, Logger } from "./logger";
import { MCServer } from "./MCServer";
import { PatchServer } from "./patchServer";
import * as WebServer from "./WebServer";

import * as dotenvSafe from "dotenv-safe";
dotenvSafe.config();

const logger = new Logger().getLogger();

// Test that we are only using NodeJS v8.x.x
// const nodeMajorVersion = parseInt(process.versions.node.split(".")[0], 10);
// if (nodeMajorVersion > 8) {
//   console.error(
//     "mco-server is not able to work with versions of nodejs due to using weak crypto. Please downgrade."
//   );
//   process.exit(-1);
// }
// console.log();

export class Server {
  public config: IServerConfiguration;
  public logger: ILoggerInstance;

  public constructor(thisLogger: ILoggerInstance) {
    this.logger = thisLogger;
    this.config = yaml.safeLoad(fs.readFileSync("./config/config.yml", "utf8"));

    // Get document, or throw exception on error
    this.config = this.loadConfig("./config/config.yml");

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

    // Start the mock patch server and shardlist sserver
    const patchServer = new PatchServer(this.logger);
    await patchServer.start(this.config);
    this.logger.debug("[webServer] Patch Server started");

    // Start the AuthLogin server
    const webServer = WebServer.start();
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
