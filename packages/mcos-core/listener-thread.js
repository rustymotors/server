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

import { createServer } from 'node:net'
import { logger } from 'mcos-shared/logger'
import { errorMessage } from 'mcos-shared'
import { processPacket } from '../mcos-gateway/sockets.js'
import { findOrNewConnection, updateConnectionByAddressAndPort } from '../mcos-gateway/connections.js'

const log = logger.child({ service: 'mcoserver:ListenerThread' })

/**
 * Handles all incomming TCP connections.
 *
 * Please use {@link ListenerThread.getInstance()}
 * @classdesc
 */
export class ListenerThread {
  /**
   *
   *
   * @private
   * @static
   * @type {ListenerThread}
   * @memberof ListenerThread
   */
  static _instance
  /**
   * Get the single instance of the connection listener
   *
   * @static
   * @return {*}  {ListenerThread}
   * @memberof ListenerThread
   */
  static getInstance () {
    if (!ListenerThread._instance) {
      ListenerThread._instance = new ListenerThread()
    }
    return ListenerThread._instance
  }

  /**
   * The onData handler
   * takes the data buffer and creates a {@link UnprocessedPacket} object
   * @param {Buffer} data
   * @param {import("mcos-core").TCPConnection} connection
   * @return {Promise<void>}
   * @memberof ListenerThread
   */
  async onTCPData (data, connection) {
    /** @type {import("mcos-shared/types").UnprocessedPacket} */
    const rawPacket = {
      connectionId: connection.id,
      connection,
      data,
      timestamp: Date.now()
    }
    // Dump the raw packet
    log.debug(
      `rawPacket's data prior to proccessing, { data: ${rawPacket.data.toString(
        'hex'
      )}}`
    )
    /** @type {{err: Error | null, data: import("mcos-core").TCPConnection | null}} */
    const processedPacket = await processPacket(rawPacket)
    if (processedPacket.err || processedPacket.data === null) {
      log.error(errorMessage(processedPacket.err))
      throw new Error(
        `There was an error processing the packet: ${errorMessage(
          processedPacket.err
        )}`
      )
    }

    if (!connection.remoteAddress) {
      throw new Error(`Remote address is empty: ${connection.toString()}`)
    }

    try {
      updateConnectionByAddressAndPort(
        connection.remoteAddress,
        connection.localPort,
        processedPacket.data
      )
    } catch (error) {
      if (error instanceof Error) {
        const newError = new Error(
          `There was an error updating the connection: ${error.message}`
        )
        log.error(newError.message)
        throw newError
      }
      throw error
    }
  }

  /**
   * Server listener method
   *
   * @param {import("node:net").Socket} socket
   * @return {void}
   */
  tcpListener (socket) {
    // Received a new connection
    // Turn it into a connection object
    const connectionRecord = findOrNewConnection(socket)

    if (connectionRecord === null) {
      log.fatal('Unable to attach the socket to a connection.')
      return
    }

    const { localPort, remoteAddress } = socket
    log.info(`Client ${remoteAddress} connected to port ${localPort}`)
    if (socket.localPort === 7003 && connectionRecord.modern.inQueue) {
      /**
       * Debug seems hard-coded to use the connection queue
       * Craft a packet that tells the client it's allowed to login
       */

      socket.write(Buffer.from([0x02, 0x30, 0x00, 0x00]))
      connectionRecord.modern.inQueue = false
    }

    socket.on('end', () => {
      log.info(`Client ${remoteAddress} disconnected from port ${localPort}`)
    })
    socket.on('data', (/** @type {Buffer} */ data) => {
      this.onTCPData(data, connectionRecord.legacy)
    })
    socket.on('error', (/** @type {unknown} */ error) => {
      const message = errorMessage(error)
      if (message.includes('ECONNRESET')) {
        return log.warn('Connection was reset')
      }
      log.error(`Socket error: ${errorMessage(error)}`)
    })
  }

  /**
   * Given a port and a connection manager object,
   * create a new TCP socket listener for that port
   *
   * @param {number} localPort
   * @return {*}  {Server}
   * @memberof ListenerThread
   */
  startTCPListener (localPort) {
    log.debug(`Attempting to bind to port ${localPort}`)
    return createServer((socket) => {
      this.tcpListener(socket)
    }).listen({ port: localPort, host: '0.0.0.0' })
  }
}
