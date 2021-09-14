// @ts-check
import { IAppConfiguration } from '@mco-server/types'
import { _sslOptions } from "./ssl-options";

/**
 * @module mco_config
 */

export class ConfigurationManager {
  getConfig(): IAppConfiguration {
    throw new Error('Method not implemented.')
  }
  static _instance: ConfigurationManager

  static getInstance(): ConfigurationManager {
    if (!ConfigurationManager._instance) {
      ConfigurationManager._instance = new ConfigurationManager()
    }
    return ConfigurationManager._instance
  }

  private constructor() {
    // Intentually empty
  }
}

export const certificate: IAppConfiguration['certificate'] = {
  privateKeyFilename: 'data/private_key.pem',
  publicKeyFilename: 'data/pub.key',
  certFilename: 'data/mcouniverse.crt',
}
export const serverSettings: IAppConfiguration['serverSettings'] = {
  ipServer: '0.0.0.0',
}
export const serviceConnections: IAppConfiguration['serviceConnections'] = {
  databaseURL: 'db.mco.db',
}
export const defaultLogLevel: IAppConfiguration['defaultLogLevel'] = 'info'

const config: IAppConfiguration = {
  certificate,
  serverSettings,
  serviceConnections,
  defaultLogLevel,
}
export default config
export {_sslOptions}
