/**
 * @exports
 * @enum {string}
 */
const EServerConnectionName = {
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
 * @property {typeof EServerConnectionAction} [action]
 * @property {typeof EServerConnectionName} name
 * @property {string} host
 * @property {number} port
 */

module.exports = {
  EServerConnectionName,
  EServerConnectionAction,
  EServiceQuery,
};
