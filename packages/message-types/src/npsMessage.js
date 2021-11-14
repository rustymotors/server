const { Buffer } = require("buffer");

/**
 * Packet container for NPS messages
 * @module NPSMsg
 */

/**
 *
 * @export
 * @typedef {Object} INPSMessageJSON
 * @property {number} msgNo
 * @property {number | undefined} opCode
 * @property {number} msgLength
 * @property {number} msgVersion
 * @property {string} content
 * @property {string} contextId
 * @property {import("../../transactions/src/types").EMessageDirection} direction
 * @property {string | undefined } sessionkey
 * @property {string} rawBuffer
 */

/*
      NPS messages are sent serialized in BE format
  */

// WORD msgNo;    NPS message number

/**
 * @class
 * @property {number} msgNo
 * @property {number} msgVersion
 * @property {number} reserved
 * @property {Buffer} content
 * @property {number} msgLength
 * @property {MESSAGE_DIRECTION} direction
 */
class NPSMessage {
  /** @type {number} */
  msgNo;
  /** @type {number} */
  msgVersion;
  /** @type {number} */
  reserved;
  /** @type {Buffer} */
  content;
  /** @type {number} */
  msgLength;
  /** @type {import("../../transactions/src/types").EMessageDirection} */
  direction;
  /**
   *
   * @param {import("../../transactions/src/types").EMessageDirection} direction - the direction of the message flow
   */
  constructor(direction) {
    this.msgNo = 0;
    this.msgVersion = 0;
    this.reserved = 0;
    this.content = Buffer.from([0x01, 0x02, 0x03, 0x04]);
    this.msgLength = this.content.length + 12;
    this.direction = direction;
    this.serviceName = "mcos:NPSMsg";
  }

  /**
   *
   * @param {Buffer} buffer
   */
  setContent(buffer) {
    this.content = buffer;
    this.msgLength = this.content.length + 12;
  }

  /**
   *
   * @return {Buffer}
   */
  getContentAsBuffer() {
    return this.content;
  }

  /**
   *
   * @return {string}
   */
  getPacketAsString() {
    return this.serialize().toString("hex");
  }

  /**
   *
   * @return {Buffer}
   */
  serialize() {
    try {
      const packet = Buffer.alloc(this.msgLength);
      packet.writeInt16BE(this.msgNo, 0);
      packet.writeInt16BE(this.msgLength, 2);
      if (this.msgLength > 4) {
        packet.writeInt16BE(this.msgVersion, 4);
        packet.writeInt16BE(this.reserved, 6);
      }

      if (this.msgLength > 8) {
        packet.writeInt32BE(this.msgLength, 8);
        this.content.copy(packet, 12);
      }

      return packet;
    } catch (error) {
      if (error instanceof Error) {
        throw new TypeError(
          `[NPSMsg] Error in serialize(): ${error.toString()}`
        );
      }

      throw new Error("[NPSMsg] Error in serialize(), error unknown");
    }
  }

  /**
   *
   * @param {Buffer} packet
   * @return {NPSMessage}
   */
  deserialize(packet) {
    this.msgNo = packet.readInt16BE(0);
    this.msgLength = packet.readInt16BE(2);
    this.msgVersion = packet.readInt16BE(4);
    this.content = packet.slice(12);
    return this;
  }

  /**
   *
   * @param {string} messageType
   * @returns {string}
   */
  dumpPacketHeader(messageType) {
    return `NPSMsg/${messageType},
          ${JSON.stringify({
            direction: this.direction,
            msgNo: this.msgNo.toString(16),
            msgVersion: this.msgVersion,
            msgLength: this.msgLength,
          })}`;
  }

  /**
   * DumpPacket
   * @return {string}
   */
  dumpPacket() {
    return `NPSMsg/NPSMsg,
          ${JSON.stringify({
            direction: this.direction,
            msgNo: this.msgNo.toString(16),
            msgVersion: this.msgVersion,
            msgLength: this.msgLength,
            content: this.content.toString("hex"),
            serialized: this.serialize().toString("hex"),
          })}`;
  }

  /**
   *
   * @return {INPSMessageJSON}
   */
  toJSON() {
    return {
      msgNo: this.msgNo,
      contextId: "",
      msgLength: this.msgLength,
      msgVersion: this.msgVersion,
      content: this.content.toString("hex"),
      direction: this.direction,
      rawBuffer: this.content.toString("hex"),
      opCode: 0,
      sessionkey: "",
    };
  }
}
module.exports = { NPSMessage };
