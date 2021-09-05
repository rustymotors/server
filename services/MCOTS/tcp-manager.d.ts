/**
 *
 * @param {IRawPacket} rawPacket
 * @return {Promise<TCPConnection>}
 */
export function defaultHandler(rawPacket: any): Promise<TCPConnection>
export type ConnectionWithPacket = {
  connection: TCPConnection
  packet: MessageNode
}
export type ConnectionWithPackets = {
  connection: TCPConnection
  packetList: MessageNode[]
}
import { TCPConnection } from '../MCServer/tcpConnection.js'
import { MessageNode } from './message-node.js'
