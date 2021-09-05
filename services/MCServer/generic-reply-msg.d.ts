/// <reference types="node" />
/**
 */
/**
 * @class
 * @property {number} msgNo
 * @property {number} toFrom
 * @property {number} appId
 * @property {number} msgReply
 * @property {Buffer} result
 * @property {Buffer} data
 * @property {Buffer} data2
 */
export class GenericReplyMessage {
  msgNo: number
  toFrom: number
  appId: number
  msgReply: number
  result: Buffer
  data: Buffer
  data2: Buffer
  /**
   * Setter data
   * @param {Buffer} value
   * @return {void}
   */
  setData(value: Buffer): void
  /**
   * Setter data2
   * @param {Buffer} value
   * @return {void}
   */
  setData2(value: Buffer): void
  /**
   *
   * @param {Buffer} buffer
   * @return {void}
   */
  deserialize(buffer: Buffer): void
  /**
   *
   * @return {Buffer}
   */
  serialize(): Buffer
  /**
   *
   * @param {Buffer} buffer
   * @return {void}
   */
  setResult(buffer: Buffer): void
  /**
   * DumpPacket
   * @return {void}
   */
  dumpPacket(): void
}
import { Buffer } from 'buffer'
