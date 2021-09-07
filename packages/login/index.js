// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
import { Logger } from '@drazisil/mco-logger'
import { Buffer } from 'buffer'

import { certificate } from '../../config/index.js'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { TCPConnection } from '../../services/MCServer/tcpConnection.js'
import { DatabaseManager } from '../../services/shared/database-manager.js'
import { NPSUserStatus } from '../../services/LoginServer/nps-user-status.js'
import { premadeLogin } from '../../services/LoginServer/packet.js'

const { log } = Logger.getInstance()

/**
 * Manages the initial game connection setup and teardown.
 */

/**
 * @class
 * @property {DatabaseManager} databaseManager
 */
export class LoginServer {
  databaseManager = DatabaseManager.getInstance()
  serviceName = 'mcoserver:LoginServer'

  /**
   *
   * @param {IRawPacket} rawPacket
   * @return {Promise<TCPConnection>}
   */
  async dataHandler(rawPacket) {
    let processed = true
    const { connection, data } = rawPacket
    const { localPort, remoteAddress } = rawPacket
    log(
      'info',
      `Received Login Server packet: ${JSON.stringify({
        localPort,
        remoteAddress,
      })}`,
      { service: this.serviceName },
    )
    // TODO: Check if this can be handled by a MessageNode object
    const { sock } = connection
    const requestCode = data.readUInt16BE(0).toString(16)

    let responsePacket

    switch (requestCode) {
      // NpsUserLogin
      case '501': {
        responsePacket = await this._userLogin(connection, data)
        break
      }

      default:
        log(
          'debug',
          `Unknown nps code recieved',
          ${JSON.stringify({
            requestCode,
            localPort,
            data: rawPacket.data.toString('hex'),
          })}`,
          { service: this.serviceName },
        )
        processed = false
    }

    if (processed && responsePacket) {
      log(
        'debug',
        `responsePacket object from dataHandler',
      ${JSON.stringify({
        userStatus: responsePacket.toString('hex'),
      })}`,
        { service: this.serviceName },
      )
      log(
        'debug',
        `responsePacket's data prior to sending: ${responsePacket.toString(
          'hex',
        )}`,
        { service: this.serviceName },
      )
      sock.write(responsePacket)
    }

    return connection
  }

  /**
   *
   * @param {string} contextId
   * @return {Promise<import('types').IUserRecordMini>}
   */
  async _npsGetCustomerIdByContextId(contextId) {
    log('debug', '>>> _npsGetCustomerIdByContextId', {
      service: this.serviceName,
    })
    /** @type {import('types').IUserRecordMini[]} */
    const users = [
      {
        contextId: '5213dee3a6bcdb133373b2d4f3b9962758',
        customerId: 0xac_01_00_00,
        userId: 0x00_00_00_02,
      },
      {
        contextId: 'd316cd2dd6bf870893dfbaaf17f965884e',
        customerId: 0x00_54_b4_6c,
        userId: 0x00_00_00_01,
      },
    ]
    if (contextId.toString() === '') {
      throw new Error(`Unknown contextId: ${contextId.toString()}`)
    }

    const userRecord = users.filter(user => user.contextId === contextId)
    if (userRecord.length !== 1) {
      log(
        'debug',
        `preparing to leave _npsGetCustomerIdByContextId after not finding record',
        ${JSON.stringify({
          contextId,
        })}`,
        { service: this.serviceName },
      )
      throw new Error(
        `Unable to locate user record matching contextId ${contextId}`,
      )
    }

    log(
      'debug',
      `preparing to leave _npsGetCustomerIdByContextId after finding record',
      ${JSON.stringify({
        contextId,
        userRecord,
      })}`,
      { service: this.serviceName },
    )
    return userRecord[0]
  }

  /**
   * Process a UserLogin packet
   * Should return a @link {module:NPSMsg} object
   * @param {TCPConnection} connection
   * @param {Buffer} data
   * @return {Promise<Buffer>}
   */
  async _userLogin(connection, data) {
    const { sock } = connection
    const { localPort } = sock
    const userStatus = new NPSUserStatus(data)
    log(
      'info',
      `Received login packet,
      ${JSON.stringify({
        localPort,
        remoteAddress: connection.remoteAddress,
      })}`,
      { service: this.serviceName },
    )

    userStatus.extractSessionKeyFromPacket(certificate, data)

    log(
      'debug',
      `UserStatus object from _userLogin,
      ${JSON.stringify({
        userStatus: userStatus.toJSON(),
      })}`,
      { service: this.serviceName },
    )
    userStatus.dumpPacket()

    // Load the customer record by contextId
    // TODO: This needs to be from a database, right now is it static
    const customer = await this._npsGetCustomerIdByContextId(
      userStatus.contextId,
    )

    // Save sessionkey in database under customerId
    log('debug', 'Preparing to update session key in db', {
      service: this.serviceName,
    })
    await this.databaseManager
      ._updateSessionKey(
        customer.customerId,
        userStatus.sessionkey,
        userStatus.contextId,
        connection.id,
      )
      .catch(error => {
        log('error', `Unable to update session key 3: ${error}`, {
          service: this.serviceName,
        })
        throw new Error('Error in userLogin')
      })

    log('info', 'Session key updated', { service: this.serviceName })

    // Create the packet content
    // TODO: This needs to be dynamically generated, right now we are using a
    // a static packet that works _most_ of the time
    const packetContent = premadeLogin()
    log('debug', `Using Premade Login: ${packetContent.toString('hex')}`, {
      service: this.serviceName,
    })

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
