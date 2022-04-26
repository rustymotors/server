// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { logger } from 'mcos-shared/logger'
import { DatabaseManager } from 'mcos-database'
import { NPSUserStatus, premadeLogin } from 'mcos-shared/types'
import { errorMessage } from 'mcos-shared'

const log = logger.child({ service: 'mcoserver:LoginServer' })

/** @type {import("mcos-shared/types").UserRecordMini[]} */
const userRecords = [
  {
    contextId: '5213dee3a6bcdb133373b2d4f3b9962758',
    customerId: 0xac_01_00_00,
    userId: 0x00_00_00_02
  },
  {
    contextId: 'd316cd2dd6bf870893dfbaaf17f965884e',
    customerId: 0x00_54_b4_6c,
    userId: 0x00_00_00_01
  }
]
/**
   * Process a UserLogin packet
   * @private
   * @param {import("mcos-shared/types").BufferWithConnection} dataConnection
   * @return {Promise<import('mcos-shared/types').BufferWithConnection>}
   */
async function login (dataConnection) {
  const { connectionId, data } = dataConnection

  log.info(
    `Received login packet: ${connectionId}`
  )

  const userStatus = new NPSUserStatus(data)

  userStatus.extractSessionKeyFromPacket(data)

  const { contextId, sessionkey } = userStatus

  log.debug(
    `UserStatus object from _userLogin,
    ${JSON.stringify({
      userStatus: userStatus.toJSON()
    })}`
  )
  userStatus.dumpPacket()

  // Load the customer record by contextId
  // TODO: This needs to be from a database, right now is it static
  const userRecord = userRecords.find(r => {
    return r.contextId === contextId
  })

  if (typeof userRecord === 'undefined') {
  // We were not able to locate the user's record
    const errMessage = `Unable to locate a user record for the context id: ${contextId}`
    log.error(errMessage)
    throw new Error('USER_NOT_FOUND')
  }

  // Save sessionkey in database under customerId
  log.debug('Preparing to update session key in db')
  await DatabaseManager.getInstance()
    .updateSessionKey(
      userRecord.customerId,
      sessionkey,
      contextId,
      connectionId
    )
    .catch((/** @type {unknown} */ error) => {
      log.error(`Unable to update session key 3: ${errorMessage(error)}`)
      throw new Error('Error in userLogin')
    })

  log.info('Session key updated')

  // Create the packet content
  // TODO: This needs to be dynamically generated, right now we are using a
  // a static packet that works _most_ of the time
  // TODO: investigate if funk/hip hop is the only radio that works.
  const packetContent = premadeLogin()
  log.debug(`Using Premade Login: ${packetContent.toString('hex')}`)

  // MsgId: 0x601
  Buffer.from([0x06, 0x01]).copy(packetContent)

  // Packet length: 0x0100 = 256
  Buffer.from([0x01, 0x00]).copy(packetContent, 2)

  // Load the customer id
  packetContent.writeInt32BE(userRecord.customerId, 12)

  // Don't use queue (+208, but I'm not sure if this includes the header or not)
  Buffer.from([0x00]).copy(packetContent, 208)

  /**
   * Return the packet twice for debug
   * Debug sends the login request twice, so we need to reply twice
   * Then send ok to login packet
   */

  // Update the data buffer
  dataConnection.data = Buffer.concat([packetContent, packetContent])
  log.debug('Leaving login')
  return dataConnection
}

const messageHandlers = [
  {
    id: '501',
    handler: login
  }
]

/**
 *
 *
 * @param {import('mcos-shared/types').BufferWithConnection} dataConnection
 * @return {Promise<import('mcos-shared/types').BufferWithConnection>}
 */
async function handleData (dataConnection) {
  const { connectionId, data } = dataConnection

  log.info(
    `Received Login Server packet: ${connectionId}`
  )

  // Check the request code
  const requestCode = data.readUInt16BE(0).toString(16)

  const supportedHandler = messageHandlers.find(h => {
    return h.id === requestCode
  })

  if (typeof supportedHandler === 'undefined') {
    // We do not yet support this message code
    log.error(`The login handler does not support a message code of ${requestCode}. Was the packet routed here in error?`)
    log.error('Closing socket.')
    dataConnection.connection.socket.end()
    throw new TypeError('UNSUPPORTED_MESSAGECODE')
  }

  const result = await supportedHandler.handler(dataConnection)
  log.debug('Leaving handleData')
  return result
}

/**
 * Entry and exit point of the Login service
 *
 * @export
 * @param {import('mcos-shared/types').BufferWithConnection} dataConnection
 * @return {Promise<{errMessage: string | null, data: import('mcos-shared/types').BufferWithConnection | null}>}
 */
export async function recieveLoginData (dataConnection) {
  try {
    return { errMessage: null, data: await handleData(dataConnection) }
  } catch (error) {
    const errMessage = `There was an error in the login service: ${errorMessage(error)}`
    return { errMessage, data: null }
  }
}
