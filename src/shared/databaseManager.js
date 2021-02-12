// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const pool = require('./db/index')
const { logger } = require('../shared/logger')
const { migrate } = require("postgres-migrations")

/**
 * Database connection abstraction
 * @module DatabaseManager
 */

/**
 * 
 * @param {module:Logger.logger} logger 
 */
 exports.doMigrations = async function doMigrations(logger) {
  logger.info('Starting migrations...')
  const client = pool.pool
  try {
    await client.connect()
  } catch (error) {
    logger.error(`Error connecting to database, exiting: ${error}`)
    process.exit(-1)
  }
  try {
    await migrate({client}, "migrations")
  } finally {
    // await client.end()
    logger.info('Migrations complete!')
  }
}

/**
 *
 */
exports.DatabaseManager = class DatabaseManager {
  /**
   *
   * @class
   * @param {logger} logger
   */
  constructor(logger) {
    this.logger = logger
  }

  /**
   *
   * @param {number} customerId
   * @return {Promise<Session_Record>}
   * @memberof {DatabaseManager}
   */
  async fetchSessionKeyByCustomerId(customerId) {
    try {
      const { rows } = await pool.query(
        'SELECT session_key, s_key FROM sessions WHERE customer_id = $1',
        [customerId]
      )
      /** @type {SessionRecord} */
      return rows[0]
    } catch (e) {
      this.logger.warn(`Unable to update session key ${e}`)
      throw new Error(e)
    }
  }

  /**
   * Fetch session key from database based on remote address
   * 
   * @param {string} connectionId
   * @return {Promise<Session_Record>}
   * @memberof {DatabaseManager}
   */
  async fetchSessionKeyByConnectionId(connectionId) {
    try {
      const { rows } = await pool.query(
        'SELECT session_key, s_key FROM sessions WHERE connection_id = $1',
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
   * @param {string} sessionKey
   * @param {string} contextId
   * @param {string} connectionId
   * @return {Promise<Session_Record[]>}
   * @memberof {DatabaseManager}
   */
  async _updateSessionKey(customerId, sessionKey, contextId, connectionId) {
    const sKey = sessionKey.substr(0, 16)
    try {
      const { rows } = await pool.query(
        'INSERT INTO sessions (customer_id, session_key, s_key, context_id, connection_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (customer_id) DO UPDATE SET session_key = $2, s_key = $3, context_id = $4, connection_id = $5',
        [customerId, sessionKey, sKey, contextId, connectionId]
      )
      return rows
    } catch (e) {
      throw new Error(`Unable to update session key: ${e}`)
    }
  }
}
