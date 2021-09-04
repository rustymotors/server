import sqlite3 from 'sqlite3'
import { ISessionRecord } from '../../src/types'
export declare class DatabaseManager {
  static _instance: DatabaseManager
  localDB: sqlite3.Database
  changes: number
  serviceName: string
  static getInstance(): DatabaseManager
  private constructor()
  fetchSessionKeyByCustomerId(customerId: number): Promise<ISessionRecord>
  fetchSessionKeyByConnectionId(connectionId: string): Promise<ISessionRecord>
  _updateSessionKey(
    customerId: number,
    sessionkey: string,
    contextId: string,
    connectionId: string,
  ): Promise<number>
}
