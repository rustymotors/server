import fs = require("fs");
import yaml = require("js-yaml");
import { logger } from "./logger";
import mcServer = require("./MCServer");
import { Web } from "./WebServer";

// Get document, or throw exception on error
try {
  const config = yaml.safeLoad(fs.readFileSync("./config/config.yml", "utf8"));
  const web = new Web();

  web.start(config);

  mcServer.run(config);
} catch (e) {
  logger.error(e);
}
