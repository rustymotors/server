/// <reference types="node" />
/**
 */
/**
 *
 *
 * @class
 * @property {number} msgNo
 * @property {Buffer} data
 * @property {Buffer} data2
 */
export class GenericRequestMessage {
  msgNo: number
  data: Buffer
  data2: Buffer
  serviceName: string
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
   * DumpPacket
   * @return {void}
   */
  dumpPacket(): void
}
import { Buffer } from 'buffer'
