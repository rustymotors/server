import * as fs from "fs";
import { IServerConfiguration } from "./services/shared/interfaces/IServerConfiguration";

export class ConfigManager {
  public config: IServerConfiguration;

  constructor() {
    this.config = JSON.parse(
      fs.readFileSync("./src/services/shared/config.json", "utf8")
    );
  }

  public getConfig() {
    return this.config;
  }
}
