/**
 * @exports
 * @enum {string}
 */
const EServerConnectionService = {
  ADMIN: "Admin",
  AUTH: "Auth",
  MCSERVER: "MCServer",
  PATCH: "Patch",
  PROXY: "Proxy",
  SHARD: "Shard",
  DATABASE: "Database",
};

/**
 * @exports
 * @enum {string}
 */
const EServerConnectionAction = {
  REGISTER_SERVICE: "Register Service",
};

/**
 * @exports
 * @enum {string}
 */
const EServiceQuery = {
  GET_CONNECTIONS: "Get connections",
};

/**
 * @export
 * @typedef {Object} ServerConnectionRecord
 * @property {EServerConnectionAction} [action]
 * @property {EServerConnectionService} service
 * @property {string} host
 * @property {number} port
 */

module.exports = {
  EServerConnectionService,
  EServerConnectionAction,
  EServiceQuery,
};
