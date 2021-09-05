/// <reference types="node" />
import { IPersonaRecord } from '../shared/types'
import { EMessageDirection } from '../MCOTS/message-node'
import { NPSMessage } from '../MCOTS/nps-msg'
/**
 * @module NPSPersonaMapsMsg
 */
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
 * @extends {NPSMsg}
 * @property {IPersonaRecord[]} personas
 * @property {number} personaSize
 * @property {number} personaCount
 */
export declare class NPSPersonaMapsMessage extends NPSMessage {
  personas: IPersonaRecord[]
  personaSize: number
  personaCount: number
  /**
   *
   * @param {module:MessageNode.MESSAGE_DIRECTION} direction
   */
  constructor(direction: EMessageDirection)
  /**
   *
   * @param {IPersonaRecord[]} personas
   * @return {void}
   */
  loadMaps(personas: IPersonaRecord[]): void
  /**
   *
   * @param {Buffer} buf
   * @return {number}
   * @memberof! NPSPersonaMapsMsg
   */
  deserializeInt8(buf: Buffer): number
  /**
   *
   * @param {Buffer} buf
   * @return {number}
   * @memberof! NPSPersonaMapsMsg
   */
  deserializeInt32(buf: Buffer): number
  /**
   *
   * @param {Buffer} buf
   * @return {string}
   * @memberof! NPSPersonaMapsMsg
   */
  deserializeString(buf: Buffer): string
  /**
   *
   * @return {Buffer}
   */
  serialize(): Buffer
  /**
   *
   * @return {void}
   */
  dumpPacket(): void
}
