// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { logger } from 'mcos-shared/logger'
import { DatabaseManager } from 'mcos-database'
import { NPSUserStatus, premadeLogin } from 'mcos-shared/types'
import { errorMessage } from 'mcos-shared'
import { handleData } from './internal.js'

const log = logger.child({ service: 'mcoserver:LoginServer' })

/**
 * Manages the initial game connection setup and teardown.
 * @module LoginServer
 */

/**
 * Please use {@link LoginServer.getInstance()}
 * @classdesc
 * @property {DatabaseManager} databaseManager
 */
export class LoginServer {
  /**
   *
   *
   * @static
   * @type {LoginServer}
   * @memberof LoginServer
   */
  static _instance
  databaseManager = DatabaseManager.getInstance()
  /**
   * Get the single instance of the login server
   *
   * @static
   * @return {LoginServer}
   * @memberof LoginServer
   */
  static getInstance () {
    if (!LoginServer._instance) {
      LoginServer._instance = new LoginServer()
    }
    return LoginServer._instance
  }

  /**
   *
   * @param {{connection: import("mcos-shared").TCPConnection, data: Buffer}} rawPacket
   * @return {Promise<import("mcos-shared").TCPConnection>}
   */
  async dataHandler (rawPacket) {
    let processed = true
    const { connection, data } = rawPacket
    const { localPort, remoteAddress } = rawPacket.connection
    log.info(
      `Received Login Server packet: ${JSON.stringify({
        localPort,
        remoteAddress
      })}`
    )
    // TODO: #1174 Check if inbound login server packet can be converted into a MessageNode object
    const { sock } = connection
    const requestCode = data.readUInt16BE(0).toString(16)

    /** @type {Buffer | null} */
    let responsePacket = null

    switch (requestCode) {
      // NpsUserLogin
      case '501': {
        responsePacket = await this._userLogin(connection, data)
        break
      }

      default:
        log.debug(
          `Unknown nps code recieved',
          ${JSON.stringify({
            requestCode,
            localPort,
            data: rawPacket.data.toString('hex')
          })}`
        )
        processed = false
    }

    if (processed === true && responsePacket !== null) {
      log.debug(
        `responsePacket object from dataHandler',
      ${JSON.stringify({
        userStatus: responsePacket.toString('hex')
      })}`
      )
      if (responsePacket instanceof Buffer) {
        const packetString = responsePacket.toString('hex')
        log.debug(`responsePacket's data prior to sending: ${packetString}`)
      }
      sock.write(responsePacket)
    }

    return connection
  }

  /**
   *
   * @private
   * @param {string} contextId
   * @return {import("mcos-shared/types").UserRecordMini}
   */
  _npsGetCustomerIdByContextId (contextId) {
    log.debug('>>> _npsGetCustomerIdByContextId')
    /** @type {import("mcos-shared/types").UserRecordMini[]} */
    const users = [
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
    if (contextId.toString() === '') {
      throw new Error(`Unknown contextId: ${contextId.toString()}`)
    }

    const userRecord = users.filter((user) => user.contextId === contextId)
    if (typeof userRecord[0] === 'undefined' || userRecord.length !== 1) {
      log.debug(
        `preparing to leave _npsGetCustomerIdByContextId after not finding record',
        ${JSON.stringify({
          contextId
        })}`
      )
      throw new Error(
        `Unable to locate user record matching contextId ${contextId}`
      )
    }

    log.debug(
      `preparing to leave _npsGetCustomerIdByContextId after finding record',
      ${JSON.stringify({
        contextId,
        userRecord
      })}`
    )
    return userRecord[0]
  }

  /**
   * Process a UserLogin packet
   * Should return a {@link NPSMessage} object
   * @private
   * @param {import("mcos-shared").TCPConnection} connection
   * @param {Buffer} data
   * @return {Promise<Buffer>}
   */
  async _userLogin (connection, data) {
    const { sock } = connection
    const { localPort } = sock
    const userStatus = new NPSUserStatus(data)
    log.info(
      `Received login packet,
      ${JSON.stringify({
        localPort,
        remoteAddress: connection.remoteAddress
      })}`
    )

    userStatus.extractSessionKeyFromPacket(data)

    log.debug(
      `UserStatus object from _userLogin,
      ${JSON.stringify({
        userStatus: userStatus.toJSON()
      })}`
    )
    userStatus.dumpPacket()

    // Load the customer record by contextId
    // TODO: #1175 Move customer records from being hard-coded to database records
    const customer = this._npsGetCustomerIdByContextId(userStatus.contextId)

    // Save sessionkey in database under customerId
    log.debug('Preparing to update session key in db')
    await this.databaseManager
      .updateSessionKey(
        customer.customerId,
        userStatus.sessionkey,
        userStatus.contextId,
        connection.id
      )
      .catch((/** @type {unknown} */ error) => {
        if (error instanceof Error) {
          log.error(`Unable to update session key 3: ${error.message}`)
        }

        throw new Error('Error in userLogin')
      })

    log.info('Session key updated')

    // Create the packet content
    // TODO: #1176 Return the login connection response packet as a MessagePacket object
    const packetContent = premadeLogin()
    log.debug(`Using Premade Login: ${packetContent.toString('hex')}`)

    // MsgId: 0x601
    Buffer.from([0x06, 0x01]).copy(packetContent)

    // Packet length: 0x0100 = 256
    Buffer.from([0x01, 0x00]).copy(packetContent, 2)

    // Load the customer id
    packetContent.writeInt32BE(customer.customerId, 12)

    // Don't use queue (+208, but I'm not sure if this includes the header or not)
    Buffer.from([0x00]).copy(packetContent, 208)

    /**
     * Return the packet twice for debug
     * Debug sends the login request twice, so we need to reply twice
     * Then send ok to login packet
     */
    return Buffer.concat([packetContent, packetContent])
  }
}

/// ==============
/// ==============

/**
 * Entry and exit point of the Login service
 *
 * @export
 * @param {import('mcos-shared/types').BufferWithConnection} dataConnection
 * @return {Promise<import('mcos-shared/types').GServiceResponse>}
 */
export async function receiveLoginData (dataConnection) {
  try {
    const response = await handleData(dataConnection)
    log.trace(`There are ${response.messages.length} messages`)
    return { err: null, response }
  } catch (error) {
    const errMessage = `There was an error in the login service: ${errorMessage(error)}`
    return { err: new Error(errMessage), response: undefined }
  }
}
