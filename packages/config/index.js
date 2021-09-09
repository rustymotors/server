// @ts-check

import { _sslOptions } from './ssl-options.js'

/** @type {import("types").IAppConfiguration["certificate"]} */
export const certificate = {
  privateKeyFilename: 'data/private_key.pem',
  publicKeyFilename: 'data/pub.key',
  certFilename: 'data/mcouniverse.crt',
}
/** @type {import("types").IAppConfiguration["serverSettings"]} */
export const serverSettings = {
  ipServer: '0.0.0.0',
}
/** @type {import("types").IAppConfiguration["serviceConnections"]} */
export const serviceConnections = {
  databaseURL: 'db.mco.db',
}
/** @type {import("types").IAppConfiguration["defaultLogLevel"]} */
export const defaultLogLevel = 'info'

/** @type {import("types").IAppConfiguration} */
const config = {
  certificate,
  serverSettings,
  serviceConnections,
  defaultLogLevel,
}
export default config
export { _sslOptions }
