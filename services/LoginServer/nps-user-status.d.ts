/// <reference types="node" />
/**
 * Structure the raw packet into a login packet structure
 * @param {Socket} socket
 * @param {Buffer} packet
 * @return {LoginPacket}
 */
/**
 *
 * @class
 * @extends {NPSMessage}
 * @property {string} sessionkey
 * @property {string} opCode
 * @property {Buffer} buffer
 */
export class NPSUserStatus extends NPSMessage {
  /**
   *
   * @param {Buffer} packet
   */
  constructor(packet: Buffer)
  sessionkey: string
  opCode: number
  contextId: string
  buffer: Buffer
  /**
   * ExtractSessionKeyFromPacket
   *
   * Take 128 bytes
   * They are the utf-8 of the hex bytes that are the key
   *
   * @param {IAppConfiguration['certificate']} serverConfig
   * @param {Buffer} packet
   * @return {void}
   */
  extractSessionKeyFromPacket(serverConfig: any, packet: Buffer): void
}
import { NPSMessage } from '../MCOTS/nps-msg.js'
import { Buffer } from 'buffer'
