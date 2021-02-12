/**
 * @global
 * @typedef IRawPacket
 * @property {string} connectionId
 * @property {module:ConnectionObj} connection
 * @property {Buffer} data
 * @property {number} localPort
 * @property {string  | undefined } remoteAddress
 * @property {number} timestamp
 */

 /**
 *
 * @global
 * @typedef IServerConfig
 * @property {string} certFilename
 * @property {string} ipServer
 * @property {string} privateKeyFilename
 * @property {string} publicKeyFilename
 * @property {string} connectionURL
 */

/**
 *
 * @global
 * @typedef IAppSettings
 * @property {IServerConfig} serverConfig
 */

 /**
 * @global
 * @typedef Session_Record
 * @property {string} s_key
 * @property {string} session_key
 */

 /** 
  * @global
  * @typedef MCOTS_Session
  * @property {module:ConnectionObj} con
  * @property {module:MessageNode[]} nodes
  */