/// <reference types="node" />
/**
 * Packet structure for communications with the game database
 * @module MessageNode
 */
/**
 * @typedef {'RECEIVED' | 'SENT'} MESSAGE_DIRECTION
 *
 */
export declare enum EMessageDirection {
  RECEIVED = 'received',
  SENT = 'sent',
}
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
export declare class MessageNode {
  direction: EMessageDirection
  msgNo: number
  seq: number
  flags: number
  data: Buffer
  dataLength: number
  mcoSig: string
  toFrom: number
  appId: number
  /**
   *
   * @param {MESSAGE_DIRECTION} direction
   */
  constructor(direction: EMessageDirection)
  /**
   *
   * @param {Buffer} packet
   * @return {void}
   */
  deserialize(packet: Buffer): void
  /**
   *
   * @return {Buffer}
   */
  serialize(): Buffer
  /**
   *
   * @param {number} appId
   * @return {void}
   */
  setAppId(appId: number): void
  /**
   *
   * @param {number} newMsgNo
   * @return {void}
   */
  setMsgNo(newMessageNo: number): void
  /**
   *
   * @param {number} newSeq
   * @return {void}
   */
  setSeq(newSeq: number): void
  /**
   *
   * @param {Buffer} packet
   * @return {void}
   */
  setMsgHeader(packet: Buffer): void
  /**
   *
   * @param {Buffer} buffer
   * @return {void}
   */
  updateBuffer(buffer: Buffer): void
  /**
   *
   * @return {boolean}
   */
  isMCOTS(): boolean
  /**
   *
   * @return {void}
   */
  dumpPacket(): void
  /**
   *
   * @return {number}
   */
  getLength(): number
  /**
   *
   * @param {Buffer} packet
   * @return {void}
   */
  BaseMsgHeader(packet: Buffer): void
}
