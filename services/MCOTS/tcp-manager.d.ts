import { MessageNode } from './message-node'
import { TCPConnection } from '../MCServer/tcpConnection'
import { IRawPacket } from '../../src/types'
export declare type ConnectionWithPacket = {
  connection: TCPConnection
  packet: MessageNode
}
export declare type ConnectionWithPackets = {
  connection: TCPConnection
  packetList: MessageNode[]
}
/**
 *
 * @param {IRawPacket} rawPacket
 * @return {Promise<ConnectionObj>}
 */
export declare function defaultHandler(
  rawPacket: IRawPacket,
): Promise<TCPConnection>
