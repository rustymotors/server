/// <reference types="node" />
export class GenericReplyMessage {
  /** @type {number} */
  msgNo: number;
  /** @type {number} */
  toFrom: number;
  /** @type {number} */
  appId: number;
  /** @type {number} */
  msgReply: number;
  /** @type {Buffer} */
  result: Buffer;
  /** @type {Buffer} */
  data: Buffer;
  /** @type {Buffer} */
  data2: Buffer;
  /**
   * Setter data
   * @param {Buffer} value
   */
  setData(value: Buffer): void;
  /**
   * Setter data2
   * @param {Buffer} value
   */
  setData2(value: Buffer): void;
  /**
   *
   * @param {Buffer} buffer
   */
  deserialize(buffer: Buffer): void;
  serialize(): Buffer;
  /**
   *
   * @param {Buffer} buffer
   */
  setResult(buffer: Buffer): void;
  /**
   * DumpPacket
   * @return {string}
   */
  dumpPacket(): string;
}
import { Buffer } from "buffer";
