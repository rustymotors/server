/// <reference types="node" />
import { IRawPacket, IUserRecordMini } from '../shared/types'
import { TCPConnection } from '../MCServer/tcpConnection'
import { DatabaseManager } from '../shared/database-manager'
/**
 * Manages the initial game connection setup and teardown.
 * @module LoginServer
 */
/**
 * @class
 * @property {DatabaseManager} databaseManager
 */
export declare class LoginServer {
  databaseManager: DatabaseManager
  serviceName: string
  constructor()
  /**
   *
   * @param {IRawPacket} rawPacket
   * @param {IServerConfig} config
   * @return {Promise<ConnectionObj>}
   */
  dataHandler(rawPacket: IRawPacket): Promise<TCPConnection>
  /**
   *
   * @param {string} contextId
   * @return {Promise<IUserRecordMini>}
   */
  _npsGetCustomerIdByContextId(contextId: string): Promise<IUserRecordMini>
  /**
   * Process a UserLogin packet
   * Should return a @link {module:NPSMsg} object
   * @param {ConnectionObj} connection
   * @param {Buffer} data
   * @param {IServerConfig} config
   * @return {Promise<Buffer>}
   */
  _userLogin(connection: TCPConnection, data: Buffer): Promise<Buffer>
}
