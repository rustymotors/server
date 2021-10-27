import { _sslOptions } from "./ssl-options";
import { savedConfig } from "./config";
import { Socket } from "net";

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
  serviceName = "MCOServer:Patch";
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

  handleData(sock: Socket): void {
    throw new Error("Not yet implemented");
  }
}

export { _sslOptions };
