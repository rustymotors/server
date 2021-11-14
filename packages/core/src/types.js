/**
 * @exports
 * @typedef {Object} LobbyCiphers
 * @property {import("crypto").Cipher | undefined} cipher
 * @property {import("crypto").Decipher | undefined} decipher
 */

/**
 * @exports
 * @enum {string}
 */
const EConnectionStatus = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};
module.exports = { EConnectionStatus };
