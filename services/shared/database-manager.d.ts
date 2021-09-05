export class DatabaseManager {
  /** @type {DatabaseManager} */
  static _instance: DatabaseManager
  /**
   *
   * @returns {DatabaseManager}
   */
  static getInstance(): DatabaseManager
  constructor(isNew?: boolean)
  /** @type {sqlite3.Database} */
  localDB: any
  changes: number
  serviceName: string
  /**
   *
   * @param {number} customerId
   * @returns {Promise<ISessionRecord>}
   */
  fetchSessionKeyByCustomerId(customerId: number): Promise<any>
  /**
   *
   * @param {string} connectionId
   * @returns {Promise<ISessionRecord>}
   */
  fetchSessionKeyByConnectionId(connectionId: string): Promise<any>
  /**
   *
   * @param {number} customerId
   * @param {string} sessionkey
   * @param {string} contextId
   * @param {string} connectionId
   * @returns {Promise<number>}
   */
  _updateSessionKey(
    customerId: number,
    sessionkey: string,
    contextId: string,
    connectionId: string,
  ): Promise<number>
}
