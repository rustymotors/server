// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { pool } = require('./db/index')
const { migrate } = require('postgres-migrations')

/**
 * Database connection abstraction
 * @module DatabaseManager
 */

/**
 *
 * @param {module:MCO_Logger.logger} logger
 * @returns {Promise<void>}
 */
module.exports.doMigrations = async function doMigrations (logger) {
  logger.info('Starting migrations...')
  const client = pool
  try {
    await client.connect()
  } catch (error) {
    logger.error('Error connecting to database, exiting: ', error)
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
 * @class
 * @property {module:MCO_Logger.logger} logger
 */
module.exports.DatabaseManager = class DatabaseManager {
  /**
   * @param {module:MCO_Logger.logger} logger
   */
  constructor (logger) {
    this.logger = logger
  }

  /**
   *
   * @param {number} customerId
   * @return {Promise<ISessionRecord>}
   * @memberof {DatabaseManager}
   */
  async fetchSessionKeyByCustomerId (customerId) {
    try {
      const { rows } = await pool.query(
        'SELECT sessionkey, skey FROM sessions WHERE customer_id = $1',
        [customerId]
      )
      /** @type {SessionRecord} */
      return rows[0]
    } catch (e) {
      this.logger.warn('Unable to update session key ', e)
      throw new Error(e)
    }
  }

  /**
   * Fetch session key from database based on remote address
   *
   * @param {string} connectionId
   * @return {Promise<ISessionRecord>}
   * @memberof {DatabaseManager}
   */
  async fetchSessionKeyByConnectionId (connectionId) {
    try {
      const { rows } = await pool.query(
        'SELECT sessionkey, skey FROM sessions WHERE connection_id = $1',
        [connectionId]
      )
      /** @type {ISession_Record} */
      return rows[0]
    } catch (e) {
      this.logger.error('Unable to update session key ', e)
      process.exit(-1)
    }
  }

  /**
   *
   * @param {number} customerId
   * @param {string} sessionkey
   * @param {string} contextId
   * @param {string} connectionId
   * @return {Promise<ISessionRecord>}
   * @memberof {DatabaseManager}
   */
  async _updateSessionKey (customerId, sessionkey, contextId, connectionId) {
    const skey = sessionkey.substr(0, 16)
    try {
      const { rows } = await pool.query(
        'INSERT INTO sessions (customer_id, sessionkey, skey, context_id, connection_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (customer_id) DO UPDATE SET sessionkey = $2, skey = $3, context_id = $4, connection_id = $5',
        [customerId, sessionkey, skey, contextId, connectionId]
      )
      /** @type {ISessionRecord} */
      return rows[0]
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`Unable to update session key: ${e.message}`)
      }
      throw new Error('Unable to update session key, error unknown')
    }
  }
}
