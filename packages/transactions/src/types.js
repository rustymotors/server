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
 * @property {import("../../core/src/tcpConnection").TCPConnection} connection
 * @property {import("../../message-types/src/messageNode.js").MessageNode} packet
 * @property {string} [lastError]
 */

/**
 * @exports
 * @typedef {Object} ConnectionWithPackets
 * @property {import("../../core/src/tcpConnection").TCPConnection} connection
 * @property {import("../../message-types/src/messageNode.js").MessageNode[]} packetList
 */

/**
 * @exports
 * @typedef {Object} UnprocessedPacket
 * @property {string} connectionId
 * @property {import("../../core/src/tcpConnection").TCPConnection} connection
 * @property {Buffer} data
 * @property {number | undefined} localPort
 * @property {string | undefined} remoteAddress
 * @property {number} timestamp
 */
module.exports = { EMessageDirection };
