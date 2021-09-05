/// <reference types="node" />
/**
 * @class
 */
export class LobbyServer {
  /**
   *
   * @return {NPSMessage}
   */
  _npsHeartbeat(): NPSMessage
  /**
   *
   * @param {IRawPacket} rawPacket
   * @return {Promise<TCPConnection>}
   */
  dataHandler(rawPacket: any): Promise<TCPConnection>
  /**
   *
   * @param {string} key
   * @return {Buffer}
   */
  _generateSessionKeyBuffer(key: string): Buffer
  /**
   * Handle a request to connect to a game server packet
   *
   * @param {TCPConnection} connection
   * @param {Buffer} rawData
   * @return {Promise<NPSMessage>}
   */
  _npsRequestGameConnectServer(
    connection: TCPConnection,
    rawData: Buffer,
  ): Promise<NPSMessage>
}
import { NPSMessage } from '../MCOTS/nps-msg.js'
import { TCPConnection } from '../MCServer/tcpConnection.js'
import { Buffer } from 'buffer'
