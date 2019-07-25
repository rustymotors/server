import * as fs from "fs";

export interface IServerConfiguration {
  serverConfig: {
    ipServer: string;
    certFilename: string;
    publicKeyFilename: string;
    privateKeyFilename: string;
    registryFilename: string;
  };
  statsDHost: string;
}

export class ConfigManager {
  public config = JSON.parse(
    fs.readFileSync("./src/services/shared/config.json", "utf8")
  );

  public getConfig() {
    return this.config;
  }
}
