import { readFileSync, statSync } from "fs";
import { privateDecrypt } from "crypto";
import { AppConfiguration } from "../../config/src/index";
export { GenericReplyMessage} from "./genericReplyMessage"
export {GenericRequestMessage} from "./genericRequestMessage"
export {StockCar} from "./stockCar"
export {LobbyInfoPacket} from "./lobbyInfo"

/**
 * @module
 */






/**
 * Packet container for NPS messages
 * @module NPSMsg
 */

/**
 *
 * @global
 * @typedef {Object} INPSMsgJSON
 * @property {number} msgNo
 * @property {number | null} opCode
 * @property {number} msgLength
 * @property {number} msgVersion
 * @property {string} content
 * @property {string} contextId
 * @property {module:MessageNode.MESSAGE_DIRECTION} direction
 * @property {string | null } sessionkey
 * @property {string} rawBuffer
 */
export interface INPSMessageJSON {
  msgNo: number;
  opCode: number | undefined;
  msgLength: number;
  msgVersion: number;
  content: string;
  contextId: string;
  direction: EMessageDirection;
  sessionkey: string | undefined;
  rawBuffer: string;
}

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
export class NPSMessage {
  msgNo: number;
  msgVersion: number;
  reserved: number;
  content: Buffer;
  msgLength: number;
  direction: EMessageDirection;
  serviceName: string;
  /**
   *
   * @param {module:MessageNode.MESSAGE_DIRECTION} direction - the direction of the message flow
   */
  constructor(direction: EMessageDirection) {
    this.msgNo = 0;
    this.msgVersion = 0;
    this.reserved = 0;
    this.content = Buffer.from([0x01, 0x02, 0x03, 0x04]);
    this.msgLength = this.content.length + 12;
    this.direction = direction;
    this.serviceName = "mcoserver:NPSMsg";
  }

  /**
   *
   * @param {Buffer} buffer
   * @return {void}
   */
  setContent(buffer: Buffer): void {
    this.content = buffer;
    this.msgLength = this.content.length + 12;
  }

  /**
   *
   * @return {Buffer}
   */
  getContentAsBuffer(): Buffer {
    return this.content;
  }

  /**
   *
   * @return {string}
   */
  getPacketAsString(): string {
    return this.serialize().toString("hex");
  }

  /**
   *
   * @return {Buffer}
   */
  serialize(): Buffer {
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
   * @return {NPSMsg}
   * @memberof NPSMsg
   */
  deserialize(packet: Buffer): NPSMessage {
    this.msgNo = packet.readInt16BE(0);
    this.msgLength = packet.readInt16BE(2);
    this.msgVersion = packet.readInt16BE(4);
    this.content = packet.slice(12);
    return this;
  }

  /**
   *
   * @param {string} messageType
   * @return {void}
   */
  dumpPacketHeader(messageType: string): string {
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
   * @return {void}
   * @memberof NPSMsg
   */
  dumpPacket(): string {
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
   * @return {INPSMsgJSON}
   */
  toJSON(): INPSMessageJSON {
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

/**
 * @module LoginMsg
 */

/**
 * @class
 * @property {number} newMsgNo
 * @property {number} toFrom
 * @property {number} appId
 * @property {number} customerId
 * @property {number} personaId
 * @property {number} lotOwnerId
 * @property {number} brandedPartId
 * @property {number} skinId
 * @property {string} personaName
 * @property {string} version
 * @property {Buffer} data
 * @property {Record<string, unknown>} struct
 */
export class LoginMessage {
  msgNo: number;
  toFrom: number;
  appId: number;
  customerId: number;
  personaId: number;
  lotOwnerId: number;
  brandedPartId: number;
  skinId: number;
  personaName: string;
  version: string;
  data: Buffer;
  /**
   *
   * @param {Buffer} buffer
   */
  constructor(buffer: Buffer) {
    this.msgNo = 0;
    this.toFrom = 0;
    this.appId = 0;

    // TODO: Why do I set these if I turn around and deserialize after?
    this.customerId = 0;
    this.personaId = 0;
    this.lotOwnerId = 0;
    this.brandedPartId = 0;
    this.skinId = 0;
    this.personaName = "NotAPerson";
    this.version = "0.0.0.0";
    this.data = buffer;

    this.deserialize(buffer);
  }

  /**
   *
   * @param {Buffer} buffer
   * @return {void}
   */
  deserialize(buffer: Buffer): void {
    try {
      this.msgNo = buffer.readInt16LE(0);
    } catch (error) {
      if (error instanceof RangeError) {
        // This is likeley not an MCOTS packet, ignore
      } else if (error instanceof Error) {
        throw new TypeError(
          `[LoginMsg] Unable to read msgNo from ${buffer.toString(
            "hex"
          )}: ${error.toString()}`
        );
      }

      throw new Error(
        `[LoginMsg] Unable to read msgNo from ${buffer.toString(
          "hex"
        )}, error unknown`
      );
    }

    this.customerId = buffer.readInt32LE(2);
    this.personaId = buffer.readInt32LE(6);

    this.lotOwnerId = buffer.readInt32LE(10);
    this.brandedPartId = buffer.readInt32LE(14);
    this.skinId = buffer.readInt32LE(18);
    this.personaName = buffer.slice(22, 34).toString();

    this.version = buffer.slice(34).toString();
  }

  /**
   * DumpPacket
   * @return {void}
   */
  dumpPacket(): string {
    return `LoginMsg',
        ${JSON.stringify({
          msgNo: this.msgNo.toString(),
          customerId: this.customerId.toString(),
          personaId: this.personaId.toString(),
          lotOwnerId: this.lotOwnerId,
          brandedPartId: this.brandedPartId,
          skinId: this.skinId,
          personaName: this.personaName,
          version: this.version,
        })}`;
  }
}

/**
 * @class
 * @property {number} msgNo
 * @property {number} noLobbies
 * @property {0 | 1} moreToCome
 * @property {LobbyInfoPacket} lobbyList
 * @property {number} dataLength
 * @property {Buffer} data
 */
export class LobbyMessage {
  msgNo: number;
  noLobbies: number;
  moreToCome: number;
  lobbyList: LobbyInfoPacket;
  dataLength: number;
  data: Buffer;
  serviceName: string;
  /**
   *
   */
  constructor() {
    this.msgNo = 325;

    this.noLobbies = 1;
    this.moreToCome = 0;

    this.lobbyList = new LobbyInfoPacket();
    // The expected length here is 572
    this.dataLength = this.lobbyList.toPacket().length + 5;

    if (this.dataLength !== 572) {
      throw new Error(
        `Unexpected length of packet! Expected 572, recieved ${this.dataLength.toString()}`
      );
    }

    this.data = Buffer.alloc(this.dataLength);
    this.data.writeInt16LE(this.msgNo, 0);
    this.data.writeInt16LE(this.noLobbies, 2);
    this.data.writeInt8(this.moreToCome, 4);
    this.lobbyList.toPacket().copy(this.data, 5);
    this.serviceName = "mcoserver:LobbyMsg";
  }

  /**
   *
   * @return {Buffer}
   */
  serialize(): Buffer {
    return this.data;
  }

  /**
   * DumpPacket
   * @return {void}
   */
  dumpPacket(): string {
    return `LobbyMsg',
        ${JSON.stringify({
          msgNo: this.msgNo,
          dataLength: this.dataLength,
          packet: this.serialize().toString("hex"),
        })}`;
  }
}

/**
 * Packet structure for communications with the game database
 * @module MessageNode
 */

/**
 * @class
 * @property {MESSAGE_DIRECTION} direction
 * @property {number} msgNo
 * @property {number} seq
 * @property {Buffer} data
 * @property {number} dataLength
 * @property {string} mcoSig
 * @property {number} toFrom
 * @property {number} appId
 */
export class MessageNode {
  direction: EMessageDirection;
  msgNo: number;
  seq: number;
  flags: number;
  data: Buffer;
  dataLength: number;
  mcoSig: string;
  toFrom: number;
  appId: number;
  /**
   *
   * @param {MESSAGE_DIRECTION} direction
   */
  constructor(direction: EMessageDirection) {
    this.direction = direction;
    this.msgNo = 0;
    this.seq = 999;
    this.flags = 0;
    this.data = Buffer.alloc(0);
    this.dataLength = 0;
    this.mcoSig = "NotAValue";

    this.toFrom = 0;
    this.appId = 0;
  }

  /**
   *
   * @param {Buffer} packet
   * @return {void}
   */
  deserialize(packet: Buffer): void {
    try {
      this.dataLength = packet.readInt16LE(0);
      this.mcoSig = packet.slice(2, 6).toString();
      this.seq = packet.readInt16LE(6);
      this.flags = packet.readInt8(10);

      // Data starts at offset 11
      this.data = packet.slice(11);

      // Set message number

      this.msgNo = this.data.readInt16LE(0);
    } catch (err) {
      const error = err as Error;
      if (error.name.includes("RangeError")) {
        // This is likeley not an MCOTS packet, ignore
        throw new Error(
          `[MessageNode] Not long enough to deserialize, only ${packet.length.toString()} bytes long`
        );
      } else {
        throw new Error(
          `[MessageNode] Unable to read msgNo from ${packet.toString(
            "hex"
          )}: ${error.toString()}`
        );
      }
    }
  }

  /**
   *
   * @return {Buffer}
   */
  serialize(): Buffer {
    const packet = Buffer.alloc(this.dataLength + 2);
    packet.writeInt16LE(this.dataLength, 0);
    packet.write(this.mcoSig, 2);
    packet.writeInt16LE(this.seq, 6);
    packet.writeInt8(this.flags, 10);
    this.data.copy(packet, 11);
    return packet;
  }

  /**
   *
   * @param {number} appId
   * @return {void}
   */
  setAppId(appId: number): void {
    this.appId = appId;
  }

  /**
   *
   * @param {number} newMsgNo
   * @return {void}
   */
  setMsgNo(newMessageNo: number): void {
    this.msgNo = newMessageNo;
    this.data.writeInt16LE(this.msgNo, 0);
  }

  /**
   *
   * @param {number} newSeq
   * @return {void}
   */
  setSeq(newSeq: number): void {
    this.seq = newSeq;
  }

  /**
   *
   * @param {Buffer} packet
   * @return {void}
   */
  setMsgHeader(packet: Buffer): void {
    const header = Buffer.alloc(6);
    packet.copy(header, 0, 0, 6);
  }

  /**
   *
   * @param {Buffer} buffer
   * @return {void}
   */
  updateBuffer(buffer: Buffer): void {
    this.data = Buffer.from(buffer);
    this.dataLength = buffer.length + 10;
    this.msgNo = this.data.readInt16LE(0);
  }

  /**
   *
   * @return {boolean}
   */
  isMCOTS(): boolean {
    return this.mcoSig === "TOMC";
  }

  /**
   *
   * @return {void}
   */
  dumpPacket(): string {
    let packetContentsArray = this.serialize().toString("hex").match(/../g);
    if (packetContentsArray === null) {
      packetContentsArray = [];
    }

    return `Message ${JSON.stringify({
      dataLength: this.dataLength,
      isMCOTS: this.isMCOTS(),
      msgNo: this.msgNo,
      direction: this.direction,
      seq: this.seq,
      flags: this.flags,
      toFrom: this.toFrom,
      appId: this.appId,
      packetContents: packetContentsArray.join("") || "",
    })}`;
  }

  /**
   *
   * @return {number}
   */
  getLength(): number {
    return this.dataLength;
  }

  /**
   *
   * @param {Buffer} packet
   * @return {void}
   */
  BaseMsgHeader(packet: Buffer): void {
    // WORD msgNo;
    this.msgNo = packet.readInt16LE(0);
  }
}

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
export class ClientConnectMessage {
  msgNo: number;
  personaId: number;
  appId: number;
  customerId: number;
  custName: string;
  personaName: string;
  mcVersion: Buffer;
  /**
   *
   * @param {Buffer} buffer
   */
  constructor(buffer: Buffer) {
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
  getAppId(): number {
    return this.appId;
  }

  /**
   * DumpPacket
   * @return {void}
   */
  dumpPacket(): string {
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
 * @typedef InpsPersonaMapsMsgSchema
 * @property {number} msgNo - uint16
 * @property {number} msgLength - uint16
 * @property {number} msgVersion - uint16
 * @property {number} reserved - uint16
 * @property {number} msgChecksum - uint16
 * @property {InpsPersonaMapsPersonaRecord[]} personas
 */

/**
 *
 * @class
 * @extends {NPSMessage}
 * @property {IPersonaRecord[]} personas
 * @property {number} personaSize
 * @property {number} personaCount
 */
export class NPSPersonaMapsMessage extends NPSMessage {
  personas: PersonaRecord[];
  personaSize: number;
  personaCount: number;
  /**
   *
   * @param {module:MessageNode.MESSAGE_DIRECTION} direction
   */
  constructor(direction: EMessageDirection) {
    super(direction);

    /** @type {IPersonaRecord[]} */
    this.personas = [];
    // Public personaSize = 1296;
    this.personaSize = 38;
    this.msgNo = 0x6_07;
    this.personaCount = 0;
    this.serviceName = "mcoserver:NPSPersonaMapsMsg";
  }

  /**
   *
   * @param {IPersonaRecord[]} personas
   * @return {void}
   */
  loadMaps(personas: PersonaRecord[]): void {
    this.personaCount = personas.length;
    this.personas = personas;
  }

  /**
   *
   * @param {Buffer} buf
   * @return {number}
   * @memberof! NPSPersonaMapsMsg
   */
  deserializeInt8(buf: Buffer): number {
    return buf.readInt8(0);
  }

  /**
   *
   * @param {Buffer} buf
   * @return {number}
   * @memberof! NPSPersonaMapsMsg
   */
  deserializeInt32(buf: Buffer): number {
    return buf.readInt32BE(0);
  }

  /**
   *
   * @param {Buffer} buf
   * @return {string}
   * @memberof! NPSPersonaMapsMsg
   */
  deserializeString(buf: Buffer): string {
    return buf.toString("utf8");
  }

  /**
   *
   * @return {Buffer}
   */
  override serialize(): Buffer {
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
   * @return {void}
   */
  override dumpPacket(): string {
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
 * @extends {NPSMsg}
 * @property {string} sessionkey
 * @property {string} opCode
 * @property {Buffer} buffer
 */
export class NPSUserStatus extends NPSMessage {
  sessionkey: string;
  opCode: number;
  contextId: string;
  buffer: Buffer;
  /**
   *
   * @param {Buffer} packet
   */
  constructor(packet: Buffer) {
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
  fetchPrivateKeyFromFile(privateKeyPath: string): string {
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
   * @param {IServerConfig} serverConfig
   * @param {Buffer} packet
   * @return {void}
   */
  extractSessionKeyFromPacket(
    serverConfig: AppConfiguration["certificate"],
    packet: Buffer
  ): void {
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
   * @return {module:NPSMsg.INPSMsgJSON}
   */
  override toJSON(): INPSMessageJSON {
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
   * @return {void}
   */
  override dumpPacket(): string {
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
 * @extends {NPSMsg}
 * @property {number} userId
 * @property {Buffer} userName
 * @property {Buffer} userData
 */
export class NPSUserInfo extends NPSMessage {
  userId: number;
  userName: Buffer;
  userData: Buffer;
  /**
   *
   * @param {MESSAGE_DIRECTION} direction
   */
  constructor(direction: EMessageDirection) {
    super(direction);
    this.userId = 0;
    this.userName = Buffer.from([0x00]); // 30 length
    this.userData = Buffer.from([0x00]); // 64 length
    this.serviceName = "mcoserver:NPSUserInfo";
  }

  /**
   *
   * @param {Buffer} rawData
   * @return {NPSUserInfo}
   */
  override deserialize(rawData: Buffer): NPSUserInfo {
    this.userId = rawData.readInt32BE(4);
    this.userName = rawData.slice(8, 38);
    this.userData = rawData.slice(38);
    return this;
  }

  /**
   * @return {void}
   */
  dumpInfo(): string {
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
export function premadeLogin(): Buffer {
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
