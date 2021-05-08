// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { Session } = require('./models')
const logger = require('../mco-logger')

/**
  *
  * @param {number} customerId
  * @return {Promise<ISessionRecord>}
  */
module.exports.fetchSessionKeyByCustomerId = async function fetchSessionKeyByCustomerId (customerId) {
  try {
    await Session.sync()
    return /** @type {ISessionRecord} */ (/** @type {unknown} */ (await Session.findByPk(customerId)))
  } catch (e) {
    logger.warn('Unable to find session key ', e)
    throw new Error(e)
  }
}

/**
 *
 * @param {number} customerId
 * @param {string} sessionkey
 * @param {string} contextId
 * @param {string} connectionId
 * @return {Promise<ISessionRecord>}
 */
module.exports._updateSessionKey = async function _updateSessionKey (customerId, sessionkey, contextId, connectionId) {
  const skey = sessionkey.substr(0, 16)
  try {
    await Session.sync()
    return /** @type {ISessionRecord} */ (/** @type {unknown} */ (await Session.upsert({
      customer_id: customerId,
      sessionkey,
      skey,
      context_id: contextId,
      connection_id: connectionId

    })))
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`Unable to update session key: ${e.message}`)
    }
    throw new Error('Unable to update session key, error unknown')
  }
}
