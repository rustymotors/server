// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const debug = require('debug')('mcoserver:ConnectionManager')
const { appSettings } = require('../../../config/app-settings')
const { ConnectionObj } = require('./ConnectionObj')
const { defaultHandler } = require('./MCOTS/TCPManager')
const { NPSPacketManager } = require('./npsPacketManager')

exports.ConnectionMgr = class ConnectionMgr {
  /**
   * Creates an instance of ConnectionMgr.
   * @param {module:Logger.logger} logger
   * @param {module:DatabaseManager} databaseManager
   */
  constructor (logger, databaseManager) {
    this.logger = logger.child({ service: 'mcoserver:ConnectionMgr' })
    this.config = appSettings
    this.databaseMgr = databaseManager
    /**
     * @type {ConnectionObj[]}
     */
    this.connections = []
    this.newConnectionId = 1
    /**
     * @type {string[]}
     */
    this.banList = []
  }

  /**
   * Check incoming data and route it to the correct handler based on localPort
   * @param {IRawPacket} rawPacket
   * @param {IServerConfig} config
   * @return {Promise<ConnectionObj>}
   * @memberof ConnectionMgr
   */
  async processData (rawPacket, config) {
    const npsPacketManager = new NPSPacketManager(this.databaseMgr)

    const { remoteAddress, localPort, data } = rawPacket

    // Log the packet as debug
    debug(
      'logging raw packet',
      {
        remoteAddress,
        localPort,
        data: data.toString('hex')
      }
    )

    if (localPort === 8226 || localPort === 8228 || localPort === 7003) {
      debug(
        'Recieved NPS packet',
        {
          msgName: npsPacketManager.msgCodetoName(
            rawPacket.data.readInt16BE(0)
          ),
          localPort
        }
      )
      try {
        return npsPacketManager.processNPSPacket(rawPacket)
      } catch (error) {
        throw new Error(`Error in connectionMgr::processData ${error}`)
      }
    }

    this.logger.info('This is an MCOTS packet')

    switch (localPort) {
      case 43300:
        return defaultHandler(rawPacket)
      default:
        // Is this a hacker?
        try {
          if (remoteAddress && this.banList.indexOf(remoteAddress) < 0) {
            // In ban list, skip
            return rawPacket.connection
          }
        } catch (error) {
          throw new Error(`Error checking ban list: ${error}`)
        }
        // Unknown request, log it
        this.logger.warn(
          '[connectionMgr] No known handler for request, banning',
          {
            localPort,
            remoteAddress,
            data: data.toString('hex')
          }
        )
        if (remoteAddress) {
          this.banList.push(remoteAddress)
        }

        return rawPacket.connection
    }
  }

  /**
   *
   * @return {string[]}
   */
  getBans () {
    return this.banList
  }

  /**
   * Locate connection by remoteAddress and localPort in the connections array
   * @param {string} remoteAddress
   * @param {number} localPort
   * @memberof ConnectionMgr
   * @return {ConnectionObj | undefined}
   */
  findConnectionByAddressAndPort (remoteAddress, localPort) {
    const results = this.connections.find(connection => {
      const match =
        remoteAddress === connection.remoteAddress &&
        localPort === connection.localPort
      return match
    })
    return results
  }

  /**
   * Locate connection by id in the connections array
   * @param {string} connectionId
   * @return {ConnectionObj | undefined}
   */
  findConnectionById (connectionId) {
    const results = this.connections.find(connection => {
      const match = connectionId === connection.id
      return match
    })
    return results
  }

  /**
   *
   * @param {string} address
   * @param {number} port
   * @param {ConnectionObj} newConnection
   * @memberof ConnectionMgr
   */
  async _updateConnectionByAddressAndPort (address, port, newConnection) {
    if (newConnection === undefined) {
      throw new Error(
        `Undefined connection: ${JSON.stringify({
          remoteAddress: address,
          localPort: port
        })}`

      )
    }
    try {
      const index = this.connections.findIndex(
        connection =>
          connection.remoteAddress === address && connection.localPort === port
      )
      this.connections.splice(index, 1)
      this.connections.push(newConnection)
    } catch (error) {
      this.logger.error(
        'Error updating connection',
        { error, connections: this.connections }
      )
    }
  }

  /**
   * Return an existing connection, or a new one
   *
   * @param {Socket} socket
   * @return {ConnectionObj}
   * @memberof ConnectionMgr
   */
  findOrNewConnection (socket) {
    const { remoteAddress, localPort } = socket
    if (!remoteAddress) {
      throw new Error(
        `No address in socket: ${JSON.stringify({
          remoteAddress,
          localPort
        })}`

      )
    }
    const con = this.findConnectionByAddressAndPort(remoteAddress, localPort)
    if (con !== undefined) {
      this.logger.info(
        `[connectionMgr] I have seen connections from ${remoteAddress} on ${localPort} before`
      )
      con.sock = socket
      return con
    }

    const newConnection = new ConnectionObj(
      `${Date.now().toString()}_${this.newConnectionId}`,
      socket,
      this
    )
    this.logger.info(
      `[connectionMgr] I have not seen connections from ${remoteAddress} on ${localPort} before, adding it.`
    )
    this.connections.push(newConnection)
    return newConnection
  }

  /**
   *
   * @memberof ConnectionMgr
   */
  resetAllQueueState () {
    this.connections = this.connections.map(connection => {
      connection.inQueue = true
      return connection
    })
  }

  /**
   * Dump all connections for debugging
   *
   * @return {ConnectionObj[]}
   * @memberof ConnectionMgr
   */
  dumpConnections () {
    return this.connections
  }
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason)
  console.trace()
  // application specific logging, throwing an error, or other logic here
})
