// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { _updateSessionKey } = require('../../@mcoserver/mco-database')
// eslint-disable-next-line no-unused-vars
const { ConnectionObj } = require('../ConnectionObj')
const logger = require('../../@mcoserver/mco-logger').child({ service: 'mcoserver:LoginServer' })
// eslint-disable-next-line no-unused-vars
const { NPSUserStatus } = require('./npsUserStatus')
const { premadeLogin } = require('./packet')

/**
 * Manages the initial game connection setup and teardown.
 * @module LoginServer
 */

/**
 * @class
 */
class LoginServer {
  /**
   *
   * @param {IRawPacket} rawPacket
   * @param {IServerConfig} config
   * @returns {Promise<ConnectionObj>}
   */
  async dataHandler (rawPacket, config) {
    const { connection, data } = rawPacket
    const { localPort, remoteAddress } = rawPacket
    logger.info(`Received Login packet: ${JSON.stringify({ localPort, remoteAddress })}`)
    // TODO: Check if this can be handled by a MessageNode object
    const { sock } = connection
    const requestCode = data.readUInt16BE(0).toString(16)

    let responsePacket

    switch (requestCode) {
      // npsUserLogin
      case '501': {
        responsePacket = await this._userLogin(connection, data, config)
        break
      }
      default:
        logger.debug(
          'Unknown nps code recieved',
          {
            requestCode,
            localPort,
            data: rawPacket.data.toString('hex')
          }
        )
        return connection
    }
    logger.debug(
      'responsePacket object from dataHandler',
      {
        userStatus: responsePacket.toString('hex')
      }
    )
    logger.debug(
      `responsePacket's data prior to sending: ${responsePacket.toString(
        'hex'
      )}`
    )
    sock.write(responsePacket)
    return connection
  }

  /**
   *
   * @param {string} contextId
   * @return {Promise<IUserRecordMini>}
   */
  async _npsGetCustomerIdByContextId (contextId) {
    logger.debug('Entering _npsGetCustomerIdByContextId...')
    /** @type {IUserRecordMini[]} */
    const users = [
      {
        contextId: '5213dee3a6bcdb133373b2d4f3b9962758',
        customerId: 0xac010000,
        userId: 0x00000002
      },
      {
        contextId: 'd316cd2dd6bf870893dfbaaf17f965884e',
        customerId: 0x0054b46c,
        userId: 0x00000001
      }
    ]
    if (contextId.toString() === '') {
      throw new Error(`Unknown contextId: ${contextId.toString()}`)
    }
    const userRecord = users.filter(user => {
      return user.contextId === contextId
    })
    if (userRecord.length !== 1) {
      logger.debug(
        'preparing to leave _npsGetCustomerIdByContextId after not finding record',
        {
          contextId
        }

      )
      throw new Error(
        `Unable to locate user record matching contextId ${contextId}`
      )
    }
    logger.debug(
      'preparing to leave _npsGetCustomerIdByContextId after finding record',
      {
        contextId,
        userRecord
      }
    )
    return userRecord[0]
  }

  /**
   * Process a UserLogin packet
   * Should return a @link {module:NPSMsg} object
   * @param {ConnectionObj} connection
   * @param {Buffer} data
   * @param {IServerConfig} config
   * @return {Promise<Buffer>}
   */
  async _userLogin (connection, data, config) {
    const { sock } = connection
    const { localPort } = sock
    const userStatus = new NPSUserStatus(data)
    logger.info(
      'Received login packet',
      {
        localPort,
        remoteAddress: connection.remoteAddress
      }
    )

    userStatus.extractSessionKeyFromPacket(config, data)

    logger.debug(
      'UserStatus object from _userLogin',
      {
        userStatus: userStatus.toJSON()
      }
    )
    userStatus.dumpPacket()

    // Load the customer record by contextId
    // TODO: This needs to be from a database, right now is it static
    const customer = await this._npsGetCustomerIdByContextId(userStatus.contextId)

    // Save sessionkey in database under customerId
    logger.debug('Preparing to update session key in db')
    await _updateSessionKey(
      customer.customerId,
      userStatus.sessionkey,
      userStatus.contextId,
      connection.id
    )
    logger.info('Session key updated')

    // Create the packet content
    // TODO: This needs to be dynamically generated, right now we are using a
    // a static packet that works _most_ of the time
    const packetContent = premadeLogin()
    logger.debug(`Using Premade Login: ${packetContent.toString('hex')}`)

    // MsgId: 0x601
    Buffer.from([0x06, 0x01]).copy(packetContent)

    // Packet length: 0x0100 = 256
    Buffer.from([0x01, 0x00]).copy(packetContent, 2)

    // load the customer id
    packetContent.writeInt32BE(customer.customerId, 12)

    // Don't use queue (+208, but I'm not sure if this includes the header or not)
    Buffer.from([0x00]).copy(packetContent, 208)

    /**
     * Return the packet twice for debug
     * Debug sends the login request twice, so we need to reply twice
     * Then send ok to login packet
     */
    const fullPacket = Buffer.concat([packetContent, packetContent])
    return fullPacket
  }
}
module.exports.LoginServer = LoginServer
