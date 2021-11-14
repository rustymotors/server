/// <reference types="node" />
export class ListenerThread {
  /** @type {ListenerThread} */
  static _instance: ListenerThread;
  /**
   *
   * @returns {ListenerThread}
   */
  static getInstance(): ListenerThread;
  /**
   * The onData handler
   * takes the data buffer and creates a IRawPacket object
   * @param {Buffer} data
   * @param {TCPConnection}
   * @returns {Promise<void>}
   */
  _onData(data: Buffer, connection: any): Promise<void>;
  /**
   * Server listener method
   * @private
   * @param {Socket} socket
   * @param {ConnectionManager} connectionMgr
   */
  private _listener;
  /**
   * Given a port and a connection manager object,
   * create a new TCP socket listener for that port
   * @param {number} localPort
   * @param {ConnectionManager}
   * @returns {Promise<Server>}
   */
  startTCPListener(localPort: number, connectionMgr: any): Promise<Server>;
}
import { Server } from "net";
