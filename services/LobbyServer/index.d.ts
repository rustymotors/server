/// <reference types="node" />
import { IRawPacket } from '../shared/types'
import { NPSMessage } from '../MCOTS/nps-msg'
import { TCPConnection } from '../MCServer/tcpConnection'
/**
 * @class
 */
export declare class LobbyServer {
  /**
   *
   * @return NPSMsg}
   */
  _npsHeartbeat(): NPSMessage
  /**
   *
   * @param {IRawPacket} rawPacket
   * @return {Promise<ConnectionObj>}
   */
  dataHandler(rawPacket: IRawPacket): Promise<TCPConnection>
  /**
   *
   * @param {string} key
   * @return {Buffer}
   */
  _generateSessionKeyBuffer(key: string): Buffer
  /**
   * Handle a request to connect to a game server packet
   *
   * @param {ConnectionObj} connection
   * @param {Buffer} rawData
   * @return {Promise<NPSMsg>}
   */
  _npsRequestGameConnectServer(
    connection: TCPConnection,
    rawData: Buffer,
  ): Promise<NPSMessage>
}
