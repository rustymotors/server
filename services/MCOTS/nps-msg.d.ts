/// <reference types="node" />
import { EMessageDirection } from './message-node'
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
  msgNo: number
  opCode: number | undefined
  msgLength: number
  msgVersion: number
  content: string
  contextId: string
  direction: EMessageDirection
  sessionkey: string | undefined
  rawBuffer: string
}
/**
 * @class
 * @property {number} msgNo
 * @property {number} msgVersion
 * @property {number} reserved
 * @property {Buffer} content
 * @property {number} msgLength
 * @property {MESSAGE_DIRECTION} direction
 */
export declare class NPSMessage {
  msgNo: number
  msgVersion: number
  reserved: number
  content: Buffer
  msgLength: number
  direction: EMessageDirection
  serviceName: string
  /**
   *
   * @param {module:MessageNode.MESSAGE_DIRECTION} direction - the direction of the message flow
   */
  constructor(direction: EMessageDirection)
  /**
   *
   * @param {Buffer} buffer
   * @return {void}
   */
  setContent(buffer: Buffer): void
  /**
   *
   * @return {Buffer}
   */
  getContentAsBuffer(): Buffer
  /**
   *
   * @return {string}
   */
  getPacketAsString(): string
  /**
   *
   * @return {Buffer}
   */
  serialize(): Buffer
  /**
   *
   * @param {Buffer} packet
   * @return {NPSMsg}
   * @memberof NPSMsg
   */
  deserialize(packet: Buffer): NPSMessage
  /**
   *
   * @param {string} messageType
   * @return {void}
   */
  dumpPacketHeader(messageType: string): void
  /**
   * DumpPacket
   * @return {void}
   * @memberof NPSMsg
   */
  dumpPacket(): void
  /**
   *
   * @return {INPSMsgJSON}
   */
  toJSON(): INPSMessageJSON
}
