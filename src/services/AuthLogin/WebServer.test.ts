import { WebServer } from "./WebServer";
import * as fs from "fs";

describe("WebServer", () => {
  test("can generate registry file", () => {
    const webServer = new WebServer();
    const staticRegistry = fs.readFileSync(
      webServer.config.serverConfig.registryFilename
    );
    const dynamicRegistry = webServer._handleGetRegistry();
    expect(dynamicRegistry).toEqual(staticRegistry.toString("UTF-8"));
  });
});
