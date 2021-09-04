/// <reference types="node" />
import { INPSMessageJSON, NPSMessage } from '../MCOTS/nps-msg'
import { IAppConfiguration } from '../../config'
/**
 * Structure the raw packet into a login packet structure
 * @param {Socket} socket
 * @param {Buffer} packet
 * @return {LoginPacket}
 */
/**
 *
 * @class
 * @extends {NPSMsg}
 * @property {string} sessionkey
 * @property {string} opCode
 * @property {Buffer} buffer
 */
export declare class NPSUserStatus extends NPSMessage {
  sessionkey: string
  opCode: number
  contextId: string
  buffer: Buffer
  /**
   *
   * @param {Buffer} packet
   */
  constructor(packet: Buffer)
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
    serverConfig: IAppConfiguration['certificate'],
    packet: Buffer,
  ): void
  /**
   *
   * @return {module:NPSMsg.INPSMsgJSON}
   */
  toJSON(): INPSMessageJSON
  /**
   * @return {void}
   */
  dumpPacket(): void
}
