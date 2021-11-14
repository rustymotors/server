const { readFileSync, statSync } = require("fs");
const { privateDecrypt } = require("crypto");
const { Buffer } = require("buffer");
const { NPSMessage } = require("./npsMessage.js");
const { EMessageDirection } = require("../../transactions/src/types.js");

/**
 * @module
 */

/**
 * @module ClientConnectMsg
 */

/**
 *
 *
 * @class
 * @property {number} msgNo
 * @property {number} personaId
 * @property {number} appId
 * @property {number} customerId
 * @property {string} custName
 * @property {string} personaName
 * @property {Buffer} mcVersion
 */
class ClientConnectMessage {
  msgNo;
  personaId;
  appId;
  customerId;
  custName;
  personaName;
  mcVersion;
  /**
   *
   * @param {Buffer} buffer
   */
  constructor(buffer) {
    try {
      this.msgNo = buffer.readInt16LE(0);
    } catch (error) {
      if (error instanceof RangeError) {
        // This is likeley not an MCOTS packet, ignore
        this.msgNo = 0;
      } else {
        throw new TypeError(
          `[ClientConnectMsg] Unable to read msgNo from ${buffer.toString(
            "hex"
          )}: ${String(error)}`
        );
      }
    }

    this.personaId = buffer.readInt32LE(6);

    // Set the appId to the Persona Id
    this.appId = this.personaId;

    this.customerId = buffer.readInt32LE(2);
    this.custName = buffer.slice(10, 41).toString();
    this.personaName = buffer.slice(42, 73).toString();
    this.mcVersion = buffer.slice(74);
  }

  /**
   *
   * @return {number}
   */
  getAppId() {
    return this.appId;
  }

  /**
   * DumpPacket
   * @return {string}
   */
  dumpPacket() {
    return `ClientConnectMsg',
      ${JSON.stringify({
        msgNo: this.msgNo.toString(),
        customerId: this.customerId.toString(),
        personaId: this.personaId.toString(),
        custName: this.custName,
        personaName: this.personaName,
        mcVersion: this.mcVersion.toString("hex"),
      })}`;
  }
}

/**
 *
 * @class
 * @extends {NPSMessage}
 * @property {PersonaRecord[]} personas
 * @property {number} personaSize
 * @property {number} personaCount
 */
class NPSPersonaMapsMessage extends NPSMessage {
  personas;
  personaSize;
  personaCount;
  /**
   *
   * @param {EMessageDirection} direction
   */
  constructor(direction) {
    super(direction);

    /** @type {import("../../persona/src/types").PersonaRecord[]} */
    this.personas = [];
    // Public personaSize = 1296;
    this.personaSize = 38;
    this.msgNo = 0x6_07;
    this.personaCount = 0;
  }

  /**
   *
   * @param {import("../../persona/src/types").PersonaRecord[]} personas
   */
  loadMaps(personas) {
    this.personaCount = personas.length;
    this.personas = personas;
  }

  /**
   *
   * @param {Buffer} buf
   * @return {number}
   */
  deserializeInt8(buf) {
    return buf.readInt8(0);
  }

  /**
   *
   * @param {Buffer} buf
   * @return {number}
   */
  deserializeInt32(buf) {
    return buf.readInt32BE(0);
  }

  /**
   *
   * @param {Buffer} buf
   * @return {string}
   */
  deserializeString(buf) {
    return buf.toString("utf8");
  }

  /**
   *
   * @return {Buffer}
   */
  serialize() {
    let index = 0;
    // Create the packet content
    // const packetContent = Buffer.alloc(40);
    const packetContent = Buffer.alloc(this.personaSize * this.personaCount);

    for (const persona of this.personas) {
      // This is the persona count
      packetContent.writeInt16BE(
        this.personaCount,
        this.personaSize * index + 0
      );

      // This is the max persona count (confirmed - debug)
      packetContent.writeInt8(
        this.deserializeInt8(persona.maxPersonas),
        this.personaSize * index + 5
      );

      // PersonaId
      packetContent.writeUInt32BE(
        this.deserializeInt32(persona.id),
        this.personaSize * index + 8
      );

      // Shard ID
      // packetContent.writeInt32BE(this.shardId, 1281);
      packetContent.writeInt32BE(
        this.deserializeInt32(persona.shardId),
        this.personaSize * index + 12
      );

      // Length of Persona Name
      packetContent.writeInt16BE(
        persona.name.length,
        this.personaSize * index + 20
      );

      // Persona Name = 30-bit null terminated string
      packetContent.write(
        this.deserializeString(persona.name),
        this.personaSize * index + 22
      );
      index++;
    }

    // Build the packet
    return packetContent;
  }

  /**
   *
   * @return {string}
   */
  dumpPacket() {
    let message = "";
    message = message.concat(this.dumpPacketHeader("NPSPersonaMapsMsg"));
    message = message.concat(
      `personaCount:        ${this.personaCount.toString()}`
    );
    for (const persona of this.personas) {
      message = message.concat(
        `
        maxPersonaCount:     ${this.deserializeInt8(
          persona.maxPersonas
        ).toString()}
        id:                  ${this.deserializeInt32(persona.id).toString()}
        shardId:             ${this.deserializeInt32(
          persona.shardId
        ).toString()}
        name:                ${this.deserializeString(persona.name).toString()}
        Packet as hex:       ${this.getPacketAsString()}`
      );

      // TODO: Work on this more

      message = message.concat(
        "[/NPSPersonaMapsMsg]======================================"
      );
    }
    return message;
  }
}

/**
 *
 * @class
 * @extends {NPSMessage}
 * @property {string} sessionkey
 * @property {number} opCode
 * @property {string} contextId
 * @property {Buffer} buffer
 */
class NPSUserStatus extends NPSMessage {
  sessionkey;
  opCode;
  contextId;
  buffer;
  /**
   *
   * @param {Buffer} packet
   */
  constructor(packet) {
    super(EMessageDirection.RECEIVED);
    this.sessionkey = "";

    // Save the NPS opCode
    this.opCode = packet.readInt16LE(0);

    // Save the contextId
    this.contextId = packet.slice(14, 48).toString();

    // Save the raw packet
    this.buffer = packet;
  }

  /**
   * Load the RSA private key
   *
   * @param {string} privateKeyPath
   * @return {string}
   */
  fetchPrivateKeyFromFile(privateKeyPath) {
    try {
      statSync(privateKeyPath);
    } catch (error) {
      if (error instanceof Error) {
        throw new TypeError(
          `[npsUserStatus] Error loading private key: ${error.message.toString()}`
        );
      }

      throw new Error(
        "[npsUserStatus] Error loading private key, error unknown"
      );
    }

    return readFileSync(privateKeyPath).toString();
  }

  /**
   * ExtractSessionKeyFromPacket
   *
   * Take 128 bytes
   * They are the utf-8 of the hex bytes that are the key
   *
   * @param {import("../../config/src/index").AppConfiguration["certificate"]} serverConfig
   * @param {Buffer} packet
   */
  extractSessionKeyFromPacket(serverConfig, packet) {
    // Decrypt the sessionkey
    const privateKey = this.fetchPrivateKeyFromFile(
      serverConfig.privateKeyFilename
    );

    const sessionkeyString = Buffer.from(
      packet.slice(52, -10).toString("utf8"),
      "hex"
    );
    const decrypted = privateDecrypt(privateKey, sessionkeyString);
    this.sessionkey = decrypted.slice(2, -4).toString("hex");
  }

  /**
   *
   * @return {import("./npsMessage").INPSMessageJSON}
   */
  toJSON() {
    return {
      msgNo: this.msgNo,
      msgLength: this.msgLength,
      msgVersion: this.msgVersion,
      content: this.content.toString("hex"),
      direction: this.direction,
      opCode: this.opCode,
      contextId: this.contextId,
      sessionkey: this.sessionkey,
      rawBuffer: this.buffer.toString("hex"),
    };
  }

  /**
   * @return {string}
   */
  dumpPacket() {
    let message = this.dumpPacketHeader("NPSUserStatus");
    message = message.concat(
      `NPSUserStatus,
      ${JSON.stringify({
        contextId: this.contextId,
        sessionkey: this.sessionkey,
      })}`
    );
    return message;
  }
}

/**
 * @class
 * @extends {NPSMessage}
 * @property {number} userId
 * @property {Buffer} userName
 * @property {Buffer} userData
 */
class NPSUserInfo extends NPSMessage {
  userId;
  userName;
  userData;
  /**
   *
   * @param {EMessageDirection} direction
   */
  constructor(direction) {
    super(direction);
    this.userId = 0;
    this.userName = Buffer.from([0x00]); // 30 length
    this.userData = Buffer.from([0x00]); // 64 length
    this.serviceName = "mcos:NPSUserInfo";
  }

  /**
   *
   * @param {Buffer} rawData
   * @return {NPSUserInfo}
   */
  deserialize(rawData) {
    this.userId = rawData.readInt32BE(4);
    this.userName = rawData.slice(8, 38);
    this.userData = rawData.slice(38);
    return this;
  }

  /**
   * @return {string}
   */
  dumpInfo() {
    let message = this.dumpPacketHeader("NPSUserInfo");
    const { userId, userName, userData } = this;
    message = message.concat(
      `UserId:        ${userId.toString()}
       UserName:      ${userName.toString()}
       UserData:      ${userData.toString("hex")}
       [/NPSUserInfo]======================================`
    );
    return message;
  }
}

/**
 * This is the response packet sent on the login port in response to a UserLogin
 *
 * @return {Buffer}
 */
function premadeLogin() {
  // TODO: Generate a dynamic login response message
  return Buffer.from([
    // Live Packet
    0x06, // +0
    0x02,
    0x01,
    0x01,
    0x21,
    0xf9,
    0x17,
    0xf2,
    0x28,
    0x85,
    0xd1,
    0x47,
    0xab,
    0x01,
    0x00,
    0x00,
    0xec, // +16
    0xf7,
    0xba,
    0x7f,
    0x45,
    0x62,
    0x53,
    0x62,
    0xfe,
    0x53,
    0x7b,
    0x03,
    0x11,
    0x27,
    0x72,
    0xbd,
    0xa3, // +32
    0x3d,
    0xa3,
    0x06,
    0x52,
    0x3a,
    0xfb,
    0x7c,
    0xd6,
    0xd5,
    0xdb,
    0x85,
    0x3d,
    0x73,
    0x66,
    0x8f,
    0x26, // +48
    0x69,
    0x65,
    0x07,
    0x37,
    0x7a,
    0xe8,
    0xc9,
    0x45,
    0x99,
    0x6a,
    0xaf,
    0xe5,
    0xdf,
    0x1c,
    0xbd,
    0x1f, // +64
    0x30,
    0xdc,
    0x5a,
    0x1a,
    0x29,
    0x4d,
    0xab,
    0x3d,
    0x0b,
    0x15,
    0xdf,
    0x33,
    0x32,
    0xdc,
    0x1e,
    0xe8,
    0x75,
    0x8b,
    0x54,
    0x34,
    0x26,
    0x0d,
    0x3a,
    0xa2,
    0xcf,
    0x2d,
    0x26,
    0x3d,
    0x7d,
    0xf7,
    0xec,
    0x3c, // +96
    0x52,
    0xb2,
    0x34,
    0x57, // +100
    0xc1,
    0x07,
    0xd7,
    0x6a,
    0xd4,
    0xdc,
    0x1e,
    0xd0,
    0x07,
    0x31,
    0xdd,
    0xe7,
    0x92,
    0x4b,
    0xf2,
    0x56,
    0xc8,
    0xb1,
    0x00,
    0x4d,
    0xd6,
    0xe8,
    0x79,
    0x14,
    0xf0,
    0x72,
    0x71,
    0x41, // +128
    0x6d,
    0xce,
    0x11,
    0xe2,
    0xae,
    0x9d,
    0xec,
    0x55,
    0x6e,
    0xdd,
    0xdf,
    0xfa,
    0xdb,
    0x09,
    0x74,
    0x61,
    0x8c,
    0x67,
    0xf6,
    0xf7,
    0x65,
    0xf3, // +150
    0x98,
    0xfd,
    0x6d,
    0x97,
    0x4b,
    0x3f,
    0x54,
    0x85,
    0x4f,
    0x2a,
    0x69,
    0x02,
    0xbe,
    0xb6, // +164
    0xd4,
    0xa3,
    0x2f,
    0x5b,
    0x86,
    0x58,
    0x19,
    0xbd,
    0xa9,
    0x9e,
    0x21,
    0x63,
    0x50,
    0x9c,
    0x43,
    0x83,
    0x42,
    0xfa,
    0xa5,
    0x81,
    0x5c,
    0x1f,
    0xad,
    0x06,
    0x64,
    0x64,
    0x7f,
    0xe1,
    0x2b,
    0xdb,
    0xd0,
    0xee, // +196
    0xa6,
    0x04,
    0x11,
    0x9a, // +200
    0x00, // (0xf6 was old val)
    0x00, // (0xc3 was old val)
    0x00, // (0x50 was old val)
    0x00, // (0x34 was old val)
    0xb4,
    0x43,
    0xf5,
    0x00, // +208 = Use Connection Queue (0xd4 was old val)
    0x00, // (0x57 was old val)
    0x27,
    0x1f,
    0x07,
    0xa3,
    0xbf,
    0x17,
    0x3d,
    0x9b,
    0x2e,
    0xde,
    0xae,
    0xdf,
    0x46,
    0x2f,
    0x30,
    0x11,
    0x70,
    0xbe,
    0x5f,
    0x90,
    0x46,
    0x0c,
    0x28, // +232
    0x33,
    0xf0,
    0x08,
    0x88,
    0x03,
    0x05,
    0xbf,
    0xe5,
    0x53,
    0xcd,
    0xfa,
    0x45,
    0x77,
    0x2e,
    0x90,
    0xf3,
    0x4d,
    0xd1, // +250
    0x44,
    0x89,
    0x00, // (0x8c was old val)
    0x00, // (0x98 was old val)
    0x00, // (0xa6 was old val)
  ]);
}
module.exports = {
  ClientConnectMessage,
  NPSPersonaMapsMessage,
  NPSUserInfo,
  NPSUserStatus,
  premadeLogin,
};
