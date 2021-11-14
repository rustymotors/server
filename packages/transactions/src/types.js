/**
 * @exports
 * @enum {string}
 */
const EMessageDirection = {
  RECEIVED: "received",
  SENT: "sent",
};

/**
 * @exports
 * @typedef {Object} ConnectionWithPacket
 * @property {TCPConnection} connection
 * @property {MessageNode} packet
 * @property {string} [lastError]
 */

/**
 * @exports
 * @typedef {Object} ConnectionWithPackets
 * @property {TCPConnection} connection
 * @property {MessageNode[]} packetList
 */

/**
 * @exports
 * @typedef {Object} UnprocessedPacket
 * @property {string} connectionId
 * @property {TCPConnection} connection
 * @property {Buffer} data
 * @property {number | undefined} localPort
 * @property {string | undefined} remoteAddress
 * @property {number} timestamp
 */
module.exports = { EMessageDirection };
