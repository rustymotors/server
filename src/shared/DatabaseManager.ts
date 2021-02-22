// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Logger } from 'winston'

import { pool } from './db/index'
import { migrate } from 'postgres-migrations'
import { ISessionRecord } from '../types'
import { VError } from 'verror'

/**
 * Database connection abstraction
 * @module DatabaseManager
 */

/**
 *
 * @param {module:Logger.logger} logger
 */
export async function doMigrations (logger: Logger): Promise<void> {
  logger.info('Starting migrations...')
  const client = pool
  try {
    await client.connect()
  } catch (error) {
    logger.error(`Error connecting to database, exiting: ${error}`)
    process.exit(-1)
  }
  try {
    await migrate({ client }, 'migrations')
  } finally {
    // await client.end()
    logger.info('Migrations complete!')
  }
}

/**
 *
 */
export class DatabaseManager {
  logger: Logger

  /**
   *
   * @class
   * @param {module:Logger.logger} logger
   */
  constructor (logger: Logger) {
    this.logger = logger
  }

  /**
   *
   * @param {number} customerId
   * @return {Promise<Session_Record>}
   * @memberof {DatabaseManager}
   */
  async fetchSessionKeyByCustomerId (customerId: number): Promise<ISessionRecord> {
    try {
      const { rows } = await pool.query(
        'SELECT sessionkey, skey FROM sessions WHERE customer_id = $1',
        [customerId]
      )
      /** @type {SessionRecord} */
      return rows[0]
    } catch (e) {
      this.logger.warn(`Unable to update session key ${e}`)
      throw new VError(e)
    }
  }

  /**
   * Fetch session key from database based on remote address
   *
   * @param {string} connectionId
   * @return {Promise<Session_Record>}
   * @memberof {DatabaseManager}
   */
  async fetchSessionKeyByConnectionId (connectionId: string): Promise<ISessionRecord> {
    try {
      const { rows } = await pool.query(
        'SELECT sessionkey, skey FROM sessions WHERE connection_id = $1',
        [connectionId]
      )
      /** @type {Session_Record} */
      return rows[0]
    } catch (e) {
      this.logger.error(`Unable to update session key ${e}`)
      process.exit(-1)
    }
  }

  /**
   *
   * @param {number} customerId
   * @param {string} sessionkey
   * @param {string} contextId
   * @param {string} connectionId
   * @return {Promise<Session_Record[]>}
   * @memberof {DatabaseManager}
   */
  async _updateSessionKey (customerId: number, sessionkey: string, contextId: string, connectionId: string): Promise<ISessionRecord> {
    const skey = sessionkey.substr(0, 16)
    try {
      const { rows } = await pool.query(
        'INSERT INTO sessions (customer_id, sessionkey, skey, context_id, connection_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (customer_id) DO UPDATE SET sessionkey = $2, skey = $3, context_id = $4, connection_id = $5',
        [customerId, sessionkey, skey, contextId, connectionId]
      )
      const results: ISessionRecord = rows[0]
      return results
    } catch (e) {
      throw new VError(`Unable to update session key: ${e}`)
    }
  }
}
