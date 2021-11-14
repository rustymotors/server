/**
 * @exports
 * @enum {string}
 *
 */
const MESSAGE_DIRECTION = {
  RECEIVED: "Recieved",
  SENT: "Sent",
};

/**
 * @export
 * @typedef InpsPersonaMapsPersonaRecord
 * @property {number} personaCount - uint16
 * @property {number} unknown1 - uint16
 * @property {number} maxPersonas - uint16
 * @property {number} unknown2 - uint16
 * @property {number} id - uint32
 * @property {number} shardId - uint32
 * @property {number} unknown3 - uint16
 * @property {number} unknown4 - uint16
 * @property {number} personaNameLength - uint16
 * @property {string} name - string(16)
 */

/**
 * @exports
 * @typedef InpsPersonaMapsMsgSchema
 * @property {number} msgNo - uint16
 * @property {number} msgLength - uint16
 * @property {number} msgVersion - uint16
 * @property {number} reserved - uint16
 * @property {number} msgChecksum - uint16
 * @property {InpsPersonaMapsPersonaRecord[]} personas
 */
module.exports = { MESSAGE_DIRECTION };
