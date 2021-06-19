// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { MessageNode, NPS_COMMANDS } = require('../../structures')
const { defaultHandler } = require('./MCOTS/TCPManager')
const { ConnectionObj } = require('./ConnectionObj')
const { NPSPacketManager } = require('./npsPacketManager')

const logger = require('../@mcoserver/mco-logger').child({ service: 'mcoserver:ConnectionMgr' })

/**
 * @module ConnectionMgr
 */

/**
 * @class
 * @property {IAppSettings} config
 * @property {module:DatabaseManager} databaseManager
 * @property {module:ConnectionObj[]} connections
 * @property {string[]} banList
 */
class ConnectionMgr {
  /**
   * Creates an instance of ConnectionMgr.
   * @param {module:DatabaseManager} databaseManager
   * @param {IAppSettings} appSettings
   */
  constructor (databaseManager, appSettings) {
    this.config = appSettings
    this.databaseMgr = databaseManager
    /**
     * @type {module:ConnectionObj[]}
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
   * @returns {Promise} {@link module:ConnectionObj~ConnectionObj}
   */
  async processData (rawPacket) {
    const npsPacketManager = new NPSPacketManager(this.databaseMgr, this.config)

    const { remoteAddress, localPort, data } = rawPacket

    // Log the packet as debug
    logger.debug(
      'logging raw packet',
      {
        remoteAddress,
        localPort,
        data: data.toString('hex')
      }
    )

    switch (localPort) {
      case 8226:
      case 8228:
      case 7003: {
        logger.debug(
          'Recieved NPS packet',
          {
            opCode: rawPacket.data.readInt16BE(0),
            msgName: `${npsPacketManager.msgCodetoName(
              rawPacket.data.readInt16BE(0)
            )} / ${this.getNameFromOpCode(rawPacket.data.readInt16BE(0))}`,
            localPort
          }
        )
        try {
          return await npsPacketManager.processNPSPacket(rawPacket)
        } catch (error) {
          throw new Error(`Error in connectionMgr::processData ${error}`)
        }
      }
      case 43300: {
        logger.debug(
          'Recieved MCOTS packet'
          // {
          //   opCode: rawPacket.data.readInt16BE(0),
          //   msgName: `${npsPacketManager.msgCodetoName(
          //     rawPacket.data.readInt16BE(0)
          //   )} / ${this.getNameFromOpCode(rawPacket.data.readInt16BE(0))}`,
          //   localPort
          // }
        )
        const newNode = MessageNode.fromBuffer(rawPacket.data)
        logger.debug(newNode)

        return defaultHandler(rawPacket)
      }
      default:
        logger.debug(rawPacket)
        throw new Error(`We received a packet on port ${localPort}. We don't what to do yet, going to throw so the message isn't lost.`)
    }
  }

  /**
   * Get the name connected to the NPS opcode
   * @param {number} opCode
   * @returns {string}
   */
  getNameFromOpCode (opCode) {
    const opCodeName = NPS_COMMANDS.find((code) => {
      return code.value === opCode
    })
    if (opCodeName === undefined) {
      throw new Error(`Unable to locate name for opCode ${opCode}`)
    }
    return opCodeName.name
  }

  /**
   * Get the name connected to the NPS opcode
   * @param {string} name
   * @returns {number}
   */
  getOpcodeFromName (name) {
    const opCode = NPS_COMMANDS.find((code) => {
      return code.name === name
    })
    if (opCode === undefined) {
      throw new Error(`Unable to locate opcode for name ${name}`)
    }
    return opCode.value
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
   * @return {module:ConnectionObj}
   */
  findConnectionByAddressAndPort (remoteAddress, localPort) {
    return this.connections.find(connection => {
      const match =
        remoteAddress === connection.remoteAddress &&
        localPort === connection.localPort
      return match
    })
  }

  /**
   * Locate connection by id in the connections array
   * @param {string} connectionId
   * @return {module:ConnectionObj}
   */
  findConnectionById (connectionId) {
    const results = this.connections.find(connection => {
      return connectionId === connection.id
    })
    if (results === undefined) {
      throw new Error(`Unable to locate connection for id ${connectionId}`)
    }
    return results
  }

  /**
   *
   * @param {string} address
   * @param {number} port
   * @param {module:ConnectionObj} newConnection
   * @returns {Promise<void>}
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
      logger.error(
        'Error updating connection',
        { error, connections: this.connections }
      )
    }
  }

  /**
   * Return an existing connection, or a new one
   *
   * @param {module:net.Socket} socket
   * @return {module:ConnectionObj}
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
      logger.info(
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
    logger.info(
      `[connectionMgr] I have not seen connections from ${remoteAddress} on ${localPort} before, adding it.`
    )
    this.connections.push(newConnection)
    return newConnection
  }

  /**
   *
   * @returns {void}
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
   * @return {module:ConnectionObj[]}
   */
  dumpConnections () {
    return this.connections
  }
}
module.exports.ConnectionMgr = ConnectionMgr

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason)
  console.trace()
  // application specific logging, throwing an error, or other logic here
  process.exit(-1)
})
