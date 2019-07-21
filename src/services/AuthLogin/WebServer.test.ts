import { WebServer } from "./WebServer";
import * as fs from "fs";
import { ConfigManager } from "../../configManager";

// get instance of config
const config = new ConfigManager().getConfig();

describe("WebServer", () => {
  test("can generate registry file", () => {
    const webServer = new WebServer(config);
    const staticRegistry = fs.readFileSync(
      config.serverConfig.registryFilename
    );
    const dynamicRegistry = webServer._handleGetRegistry();
    expect(dynamicRegistry).toEqual(staticRegistry.toString("UTF-8"));
  });
});
