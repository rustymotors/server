import fs = require("fs");
import yaml = require("js-yaml");
import { IServerConfiguration } from "./IServerConfiguration";
import { logger } from "./logger";
import { MCServer } from "./MCServer";
import { PatchServer } from "./patchServer";
import { WebServer } from "./WebServer";

const mcServer = new MCServer();

// Get document, or throw exception on error
try {
  const config: IServerConfiguration = yaml.safeLoad(
    fs.readFileSync("./config/config.yml", "utf8")
  );

  // Start the mock patch server
  const patchServer = new PatchServer();
  patchServer.start(config);
  logger.info("[webServer] Patch Server started");

  // Start the AuthLogin and shardlist servers
  const webServer = new WebServer();
  webServer.start(config.serverConfig);
  logger.info("[webServer] Web Server started");

  mcServer.startServers(config);
} catch (e) {
  logger.error(e);
}
