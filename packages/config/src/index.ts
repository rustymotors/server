import { _sslOptions } from "./ssl-options";
import { savedConfig } from "./config";
import P from "pino";

const log = P().child({ service: "MCOServer:Patch" });
log.level = process.env["LOG_LEVEL"] || "info";

export type AppConfiguration = {
  certificate: {
    privateKeyFilename: string;
    publicKeyFilename: string;
    certFilename: string;
  };
  serverSettings: {
    ipServer: string;
  };
  serviceConnections: {
    databaseURL: string;
  };
  defaultLogLevel: string;
};

export class ConfigurationManager {
  getConfig(): AppConfiguration {
    return savedConfig;
  }
  static _instance: ConfigurationManager;

  static getInstance(): ConfigurationManager {
    if (!ConfigurationManager._instance) {
      ConfigurationManager._instance = new ConfigurationManager();
    }
    return ConfigurationManager._instance;
  }

  private constructor() {
    // Intentionally empty
  }

  handleData(this: ConfigurationManager, data: Buffer): void {
    const payload = data.toString();
    log.debug(`Payload: ${payload}`);
    // TODO: feat: have config server react to payloads - https://github.com/drazisil/mco-server/issues/1017
  }
}

export { _sslOptions };
