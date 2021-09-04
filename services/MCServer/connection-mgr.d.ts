/// <reference types="node" />
export class ConnectionManager {
  /**
   * @type {ConnectionManager}
   */
  static _instance: ConnectionManager
  static getInstance(): ConnectionManager
  constructor(isNew?: boolean)
  databaseMgr: DatabaseManager
  /**
   * @type {TCPConnection[]}
   */
  connections: TCPConnection[]
  newConnectionId: number
  /**
   * @type {string[]}
   */
  banList: string[]
  serviceName: string
  /**
   *
   * @param {string} connectionId
   * @param {Socket} socket
   * @returns
   */
  newConnection(connectionId: string, socket: Socket): TCPConnection
  /**
   * Check incoming data and route it to the correct handler based on localPort
   * @param {import('../../src/types').IRawPacket} rawPacket
   * @return {Promise<TCPConnection>}
   */
  processData(
    rawPacket: import('../../src/types').IRawPacket,
  ): Promise<TCPConnection>
  /**
   * Get the name connected to the NPS opcode
   * @param {number} opCode
   * @return {string}
   */
  getNameFromOpCode(opCode: number): string
  /**
   * Get the name connected to the NPS opcode
   * @param {string} name
   * @return {number}
   */
  getOpcodeFromName(name: string): number
  /**
   *
   * @return {string[]}
   */
  getBans(): string[]
  /**
   * Locate connection by remoteAddress and localPort in the connections array
   * @param {string} remoteAddress
   * @param {number} localPort
   * @memberof ConnectionMgr
   * @return {TCPConnection | undefined}
   */
  findConnectionByAddressAndPort(
    remoteAddress: string,
    localPort: number,
  ): TCPConnection | undefined
  /**
   * Locate connection by id in the connections array
   * @param {string} connectionId
   * @return {TCPConnection}
   */
  findConnectionById(connectionId: string): TCPConnection
  /**
   *
   * @param {string} address
   * @param {number} port
   * @param {TCPConnection} newConnection
   * @return {Promise<void>}
   */
  _updateConnectionByAddressAndPort(
    address: string,
    port: number,
    newConnection: TCPConnection,
  ): Promise<void>
  /**
   * Return an existing connection, or a new one
   *
   * @param {Socket} socket
   * @return {TCPConnection}
   */
  findOrNewConnection(socket: Socket): TCPConnection
  /**
   *
   * @return {void}
   */
  resetAllQueueState(): void
  /**
   * Dump all connections for debugging
   *
   * @return {TCPConnection[]}
   */
  dumpConnections(): TCPConnection[]
}
import { DatabaseManager } from '../shared/database-manager'
import { TCPConnection } from './tcpConnection'
import { Socket } from 'net'
