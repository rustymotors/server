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

import { NPS_COMMANDS, MessageNode } from 'mcos-shared/types'
import { EncryptionManager } from './encryption-mgr.js'
import { NPSPacketManager } from './nps-packet-manager.js'
import { TCPConnection } from './tcpConnection.js'
import { MCOTServer } from 'mcos-transactions'
import { logger } from 'mcos-shared/logger'
import { randomUUID } from 'node:crypto'
import { isMCOT } from './index.js'
import { errorMessage } from 'mcos-shared'

const log = logger.child({
  service: 'ConnectionManager'
})

/**
 * Manages the connection objects that connect the network sockets to server metadata
 * Use {@link ConnectionManager.getConnectionManager()}
 * @classdesc
 */
export class ConnectionManager {
  /**
   *
   *
   * @private
   * @static
   * @type {ConnectionManager}
   * @memberof ConnectionManager
   */
  static _instance
  /**
   *
   *
   * @private
   * @type {TCPConnection[]}
   * @memberof ConnectionManager
   */
  _connections = []
  /**
   *
   *
   * @private
   * @type {string[]}
   * @memberof ConnectionManager
   */
  _banList = []
  /**
   * Get the single instance of the connection manager
   *
   * @static
   * @return {*}  {ConnectionManager}
   * @memberof ConnectionManager
   */
  static getConnectionManager () {
    if (!ConnectionManager._instance) {
      ConnectionManager._instance = new ConnectionManager()
    }
    return ConnectionManager._instance
  }

  /**
   * Creates a new connection object for the socket and adds to list
   * @param {string} connectionId
   * @param {import("node:net").Socket} socket
   * @returns {TCPConnection}
   */
  newConnection (connectionId, socket) {
    const newConnection = new TCPConnection(connectionId, socket)
    newConnection.setManager(this)
    newConnection.setEncryptionManager(new EncryptionManager())
    return newConnection
  }

  /**
   * Check incoming data and route it to the correct handler based on localPort
   *
   * @param {import("mcos-shared/types").UnprocessedPacket} rawPacket
   * @return {Promise<{err: Error | null, data: TCPConnection | null}>}
   * @memberof ConnectionManager
   */
  async processData (rawPacket) {
    const npsPacketManager = new NPSPacketManager()

    const { data } = rawPacket
    const { remoteAddress, localPort } = rawPacket.connection

    // Log the packet as debug
    log.debug(
      `logging raw packet,
      ${JSON.stringify({
        remoteAddress,
        localPort,
        data: data.toString('hex')
      })}`
    )

    let packetType = 'tcp'

    if (isMCOT(rawPacket.data)) {
      packetType = 'tomc'
    }

    log.debug(
      `Identified packet type as ${packetType} on port ${rawPacket.connection.localPort}`
    )

    if (localPort === 8226) {
      log.debug('Packet has requested the login server')
    }
    if (localPort === 8228) {
      log.debug('Packet has requested the persona server')
    }
    if (localPort === 7003) {
      log.debug('Packet has requested the lobby server')
    }
    if (localPort === 43300) {
      log.debug('Packet has requested the transactions server')
    }

    switch (localPort) {
      case 8226:
      case 8228:
      case 7003: {
        try {
          const opCode = rawPacket.data.readInt16BE(0)
          const msgName = this.getNameFromOpCode(rawPacket.data.readInt16BE(0))
          log.debug(
            `Recieved NPS packet,
            ${JSON.stringify({
              opCode,
              msgName,
              localPort
            })}`
          )
        } catch (error) {
          log.error(errorMessage(error))
          return {
            err: new Error(
              `Error in the recieved packet: ${errorMessage(error)}`
            ),
            data: null
          }
        }
        try {
          return {
            err: null,
            data: await npsPacketManager.processNPSPacket(rawPacket)
          }
        } catch (error) {
          log.error(errorMessage(error))
          return {
            err: new Error(
              `There was an error processing the data: ${errorMessage(error)}`
            ),
            data: null
          }
        }
      }

      case 43_300: {
        log.debug('Recieved MCOTS packet')
        const newNode = new MessageNode('recieved')
        newNode.deserialize(rawPacket.data)
        log.debug(JSON.stringify(newNode))

        return MCOTServer.getTransactionServer().defaultHandler(rawPacket)
      }

      default:
        log.debug(JSON.stringify(rawPacket))

        throw new Error(
          `We received a packet on port ${localPort}. We don't what to do yet, going to throw so the message isn't lost.`
        )
    }
  }

  /**
   * Get the name connected to the NPS opcode
   * @param {number} opCode
   * @return {string}
   */
  getNameFromOpCode (opCode) {
    const opCodeName = NPS_COMMANDS.find((code) => code.value === opCode)
    if (opCodeName === undefined) {
      throw new Error(`Unable to locate name for opCode ${opCode}`)
    }

    return opCodeName.name
  }

  /**
   * Get the name connected to the NPS opcode
   * @param {string} name
   * @return {number}
   */
  getOpcodeFromName (name) {
    const opCode = NPS_COMMANDS.find((code) => code.name === name)
    if (opCode === undefined) {
      throw new Error(`Unable to locate opcode for name ${name}`)
    }

    return opCode.value
  }

  /**
   * Get the internal banns list
   *
   * @deprecated
   * @return {string[]}
   */
  getBans () {
    return this._banList
  }

  /**
   * Locate connection by remoteAddress and localPort in the connections array
   * @param {string} remoteAddress
   * @param {number} localPort
   * @memberof ConnectionMgr
   * @return {TCPConnection | null}
   */
  findConnectionByAddressAndPort (remoteAddress, localPort) {
    return (
      this._connections.find((connection) => {
        const match =
          remoteAddress === connection.remoteAddress &&
          localPort === connection.localPort
        return match
      }) || null
    )
  }

  /**
   * Locate connection by id in the connections array
   *
   * @param {string} connectionId
   * @return {*}  {TCPConnection}
   * @memberof ConnectionManager
   */
  findConnectionById (connectionId) {
    const results = this._connections.find(
      (connection) => connectionId === connection.id
    )
    if (results === undefined) {
      throw new Error(`Unable to locate connection for id ${connectionId}`)
    }

    return results
  }

  /**
   * Update the internal connection record
   *
   * @param {string} address
   * @param {number} port
   * @param {TCPConnection} newConnection
   * @return {*}  {TCPConnection[]} the updated connection
   * @memberof ConnectionManager
   */
  updateConnectionByAddressAndPort (address, port, newConnection) {
    if (newConnection === undefined) {
      throw new Error(
        `Undefined connection: ${JSON.stringify({
          remoteAddress: address,
          localPort: port
        })}`
      )
    }

    try {
      const index = this._connections.findIndex(
        (connection) =>
          connection.remoteAddress === address && connection.localPort === port
      )
      this._connections.splice(index, 1)
      this._connections.push(newConnection)
      return this._connections
    } catch (error) {
      process.exitCode = -1
      throw new Error(
        `Error updating connection, ${JSON.stringify({
          error,
          connections: this._connections
        })}`
      )
    }
  }

  /**
   * Return an existing connection, or a new one
   *
   * @param {import("node:net").Socket} socket
   * @return {TCPConnection | null}
   * @memberof ConnectionManager
   */
  findOrNewConnection (socket) {
    if (typeof socket.remoteAddress === 'undefined') {
      log.fatal('The socket is missing a remoteAddress, unable to use.')
      return null
    }

    if (typeof socket.localPort === 'undefined') {
      log.fatal('The socket is missing a localPost, unable to use.')
      return null
    }

    const existingConnection = this.findConnectionByAddressAndPort(
      socket.remoteAddress,
      socket.localPort
    )
    if (existingConnection) {
      log.info(
        `I have seen connections from ${socket.remoteAddress} on ${socket.localPort} before`
      )
      existingConnection.sock = socket
      log.debug('Returning found connection after attaching socket')
      return existingConnection
    }

    const newConnectionId = randomUUID()
    log.debug(`Creating new connection with id ${newConnectionId}`)
    const newConnection = this.newConnection(newConnectionId, socket)
    log.info(
      `I have not seen connections from ${socket.remoteAddress} on ${socket.localPort} before, adding it.`
    )
    const updatedConnectionList = this.addConnection(newConnection)
    log.debug(
      `Connection with id of ${newConnection.id} has been added. The connection list now contains ${updatedConnectionList.length} connections.`
    )
    return newConnection
  }

  /**
   * Add new connection to internal list
   *
   * @param {TCPConnection} connection
   * @return {TCPConnection[]}
   * @memberof ConnectionManager
   */
  addConnection (connection) {
    this._connections.push(connection)
    return this._connections
  }

  /**
   * Places all connection into the queue
   * @return {TCPConnection[]}
   */
  returnAllConnectionsToQueue () {
    this._connections = this._connections.map((connection) => {
      connection.inQueue = true
      return connection
    })
    return this._connections
  }

  /**
   * Resets the connections list
   * @returns {TCPConnection[]}
   */
  clearConnectionList () {
    this._connections = []
    return this._connections
  }

  /**
   * Dump all connections for debugging
   * @return {TCPConnection[]}
   */
  fetchConnectionList () {
    return this._connections
  }
}

/**
 * Return the ConnectionManager class instance
 * @returns {ConnectionManager}
 */
export function getConnectionManager () {
  return ConnectionManager.getConnectionManager()
}
