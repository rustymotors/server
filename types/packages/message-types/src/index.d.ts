/// <reference types="node" />
/**
 * This is the response packet sent on the login port in response to a UserLogin
 *
 * @return {Buffer}
 */
export function premadeLogin(): Buffer;
export { GenericReplyMessage } from "./genericReplyMessage";
export { GenericRequestMessage } from "./genericRequestMessage";
export { StockCar } from "./stockCar";
export { LobbyInfoPacket } from "./lobbyInfo";
export { LoginMessage } from "./loginMessage";
export { StockCarInfoMessage } from "./stockCarInfoMessage";
export { LobbyMessage } from "./lobbyMessage";
export { MessageNode } from "./messageNode";
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
export class ClientConnectMessage {
  /**
   *
   * @param {Buffer} buffer
   */
  constructor(buffer: Buffer);
  msgNo: number;
  personaId: number;
  appId: number;
  customerId: number;
  custName: string;
  personaName: string;
  mcVersion: Buffer;
  /**
   *
   * @return {number}
   */
  getAppId(): number;
  /**
   * DumpPacket
   * @return {string}
   */
  dumpPacket(): string;
}
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
/**
 *
 * @class
 * @extends {NPSMessage}
 * @property {PersonaRecord[]} personas
 * @property {number} personaSize
 * @property {number} personaCount
 */
export class NPSPersonaMapsMessage extends NPSMessage {
  /**
   *
   * @param {EMessageDirection} direction
   */
  constructor(direction: EMessageDirection);
  personas: any[];
  personaSize: number;
  personaCount: number;
  /**
   *
   * @param {PersonaRecord[]} personas
   */
  loadMaps(personas: any[]): void;
  /**
   *
   * @param {Buffer} buf
   * @return {number}
   */
  deserializeInt8(buf: Buffer): number;
  /**
   *
   * @param {Buffer} buf
   * @return {number}
   */
  deserializeInt32(buf: Buffer): number;
  /**
   *
   * @param {Buffer} buf
   * @return {string}
   */
  deserializeString(buf: Buffer): string;
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
export class NPSUserStatus extends NPSMessage {
  /**
   *
   * @param {Buffer} packet
   */
  constructor(packet: Buffer);
  sessionkey: string;
  opCode: number;
  contextId: string;
  buffer: Buffer;
  /**
   * Load the RSA private key
   *
   * @param {string} privateKeyPath
   * @return {string}
   */
  fetchPrivateKeyFromFile(privateKeyPath: string): string;
  /**
   * ExtractSessionKeyFromPacket
   *
   * Take 128 bytes
   * They are the utf-8 of the hex bytes that are the key
   *
   * @param {AppConfiguration["certificate"]} serverConfig
   * @param {Buffer} packet
   */
  extractSessionKeyFromPacket(serverConfig: any, packet: Buffer): void;
}
/**
 * @class
 * @extends {NPSMessage}
 * @property {number} userId
 * @property {Buffer} userName
 * @property {Buffer} userData
 */
export class NPSUserInfo extends NPSMessage {
  /**
   *
   * @param {EMessageDirection} direction
   */
  constructor(direction: EMessageDirection);
  userId: number;
  userName: Buffer;
  userData: Buffer;
  /**
   * @return {string}
   */
  dumpInfo(): string;
}
export type InpsPersonaMapsPersonaRecord = {
  /**
   * - uint16
   */
  personaCount: number;
  /**
   * - uint16
   */
  unknown1: number;
  /**
   * - uint16
   */
  maxPersonas: number;
  /**
   * - uint16
   */
  unknown2: number;
  /**
   * - uint32
   */
  id: number;
  /**
   * - uint32
   */
  shardId: number;
  /**
   * - uint16
   */
  unknown3: number;
  /**
   * - uint16
   */
  unknown4: number;
  /**
   * - uint16
   */
  personaNameLength: number;
  /**
   * - string(16)
   */
  name: string;
};
export type InpsPersonaMapsMsgSchema = {
  /**
   * - uint16
   */
  msgNo: number;
  /**
   * - uint16
   */
  msgLength: number;
  /**
   * - uint16
   */
  msgVersion: number;
  /**
   * - uint16
   */
  reserved: number;
  /**
   * - uint16
   */
  msgChecksum: number;
  personas: InpsPersonaMapsPersonaRecord[];
};
import { Buffer } from "buffer";
import { NPSMessage } from ".";
import { EMessageDirection } from "../../transactions/src/tcp-manager";
export { NPSMessage, INPSMessageJSON } from "./npsMessage";
