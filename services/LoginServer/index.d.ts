/// <reference types="node" />
/**
 * Manages the initial game connection setup and teardown.
 */
/**
 * @class
 * @property {DatabaseManager} databaseManager
 */
export class LoginServer {
  databaseManager: DatabaseManager
  serviceName: string
  /**
   *
   * @param {IRawPacket} rawPacket
   * @return {Promise<TCPConnection>}
   */
  dataHandler(rawPacket: any): Promise<TCPConnection>
  /**
   *
   * @param {string} contextId
   * @return {Promise<IUserRecordMini>}
   */
  _npsGetCustomerIdByContextId(contextId: string): Promise<any>
  /**
   * Process a UserLogin packet
   * Should return a @link {module:NPSMsg} object
   * @param {TCPConnection} connection
   * @param {Buffer} data
   * @return {Promise<Buffer>}
   */
  _userLogin(connection: TCPConnection, data: Buffer): Promise<Buffer>
}
import { DatabaseManager } from '../shared/database-manager.js'
import { TCPConnection } from '../MCServer/tcpConnection.js'
import { Buffer } from 'buffer'
