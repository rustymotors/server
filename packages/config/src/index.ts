// @ts-check
import { IAppConfiguration } from "@mco-server/types";
import { _sslOptions } from "./ssl-options";
import { savedConfig } from "./config";

/**
 * @module mco_config
 */

export class ConfigurationManager {
  getConfig(): IAppConfiguration {
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
}

export { _sslOptions };
