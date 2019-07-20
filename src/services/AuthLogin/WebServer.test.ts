import { WebServer } from "./WebServer";
import { Logger } from "../shared/logger";
import * as fs from "fs";
import { ConfigManager } from "../../configManager";

// get instance of loggers
const loggers = new Logger().getLoggers();

// get instance of config
const config = new ConfigManager().getConfig();

describe("WebServer", () => {
  test("can generate registry file", () => {
    const webServer = new WebServer(config, loggers);
    const staticRegistry = fs.readFileSync(
      config.serverConfig.registryFilename
    );
    const dynamicRegistry = webServer._handleGetRegistry();
    expect(dynamicRegistry).toEqual(staticRegistry.toString("UTF-8"));
  });
});
