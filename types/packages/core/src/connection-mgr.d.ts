/// <reference types="node" />
export class ConnectionManager {
  /** @type {ConnectionManager} */
  static _instance: ConnectionManager;
  /**
   *
   * @returns {ConnectionManager}
   */
  static getInstance(): ConnectionManager;
  /** @type {DatabaseManager} */
  databaseMgr: DatabaseManager;
  /** @type {TCPConnection[]} */
  connections: TCPConnection[];
  /** @type {number} */
  newConnectionId: number;
  /** @type {string[]} */
  banList: string[];
  /**
   *
   * @param {string} connectionId
   * @param {Socket} socket
   * @returns {TCPConnection}
   */
  newConnection(connectionId: string, socket: Socket): TCPConnection;
  /**
   * Check incoming data and route it to the correct handler based on localPort
   * @param {import("../../transactions/src/tcp-manager").UnprocessedPacket} rawPacket
   * @returns {Promise<TCPConnection>}
   */
  processData(
    rawPacket: import("../../transactions/src/tcp-manager").UnprocessedPacket
  ): Promise<TCPConnection>;
  /**
   * Get the name connected to the NPS opcode
   * @param {number} opCode
   * @return {string}
   */
  getNameFromOpCode(opCode: number): string;
  /**
   * Get the name connected to the NPS opcode
   * @param {string} name
   * @return {number}
   */
  getOpcodeFromName(name: string): number;
  /**
   *
   * @return {string[]}
   */
  getBans(): string[];
  /**
   * Locate connection by remoteAddress and localPort in the connections array
   * @param {string} remoteAddress
   * @param {number} localPort
   * @return {TCPConnection | undefined}
   */
  findConnectionByAddressAndPort(
    remoteAddress: string,
    localPort: number
  ): TCPConnection | undefined;
  /**
   * Locate connection by id in the connections array
   * @param {string} connectionId
   * @returns {TCPConnection}
   */
  findConnectionById(connectionId: string): TCPConnection;
  /**
   *
   * @param {string} address
   * @param {number} port
   * @param {TCPConnection} newConnection
   */
  _updateConnectionByAddressAndPort(
    address: string,
    port: number,
    newConnection: TCPConnection
  ): Promise<void>;
  /**
   * Return an existing connection, or a new one
   * @param {Socket} socket
   * @returns {TCPConnection}
   */
  findOrNewConnection(socket: Socket): TCPConnection;
  /**
   *
   */
  resetAllQueueState(): void;
  /**
   * Dump all connections for debugging
   * @returns {TCPConnection[]}
   */
  dumpConnections(): TCPConnection[];
}
import { DatabaseManager } from "../../database/src/index";
import { TCPConnection } from "./tcpConnection";
import { Socket } from "net";
