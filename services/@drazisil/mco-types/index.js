/**
 * @global
 * @readonly
 * @constant {object} EServerConnectionName
 * @property {string} EServerConnectionName.ADMIN "Admin"
 * @property {string} EServerConnectionName.AUTH "Auth"
 * @property {string} EServerConnectionName.MCSERVER "MCServer"
 * @property {string} EServerConnectionName.PATCH "Patch"
 * @property {string} EServerConnectionName.PROXY "Proxy"
 * @property {string} EServerConnectionName.SHARD "Shard"
 */
export const EServerConnectionName = Object.freeze({
  ADMIN: 'Admin',
  AUTH: 'Auth',
  MCSERVER: 'MCServer',
  PATCH: 'Patch',
  PROXY: 'Proxy',
  SHARD: 'Shard',
})

/**
 * @global
 * @readonly
 * @constant {object} EServerConnectionAction
 * @property {string} EServerConnectionAction.REGISTER_SERVICE "Register Service"
 */
export const EServerConnectionAction = Object.freeze({
  REGISTER_SERVICE: 'Register Service',
})

/**
 * @global
 * @readonly
 * @constant {object} EServiceQuery
 * @property {string} EServiceQuery.GET_CONNECTIONS "Get connections"
 */
export const EServiceQuery = Object.freeze({
  GET_CONNECTIONS: 'Get connections',
})

/**
 * @global
 * @typedef {object} IServerConnection
 * @property {EServerConnectionAction} [IServerConnection.action]
 * @property {EServerConnectionName} IServerConnection.service
 * @property {string} IServerConnection.host
 * @property {number} IServerConnection.port
 */
