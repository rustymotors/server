// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const debug = require('debug')
const net = require('net')

/**
 * TCP Listener thread
 * @module ListenerThread
 */

/**
 *
 */
exports.ListenerThread = class ListenerThread {
  /**
   * @class
   * @param {IAppSettings} config
   * @param {module:Logger.logger} logger
   */
  constructor (config, logger) {
    this.config = config
    this.logger = logger
  }

  /**
   * the onData handler
   * takes the data buffer and creates a IRawPacket object
   *
   * @param {Buffer} data
   * @param {module:ConnectionObj} connection
   * @param {module:IServerConfig} config
   * @memberof! ListenerThread
   */
  async _onData (data, connection, config) {
    try {
      const { localPort, remoteAddress } = connection.sock
      /** @type {IRawPacket} */
      const rawPacket = {
        connectionId: connection.id,
        connection,
        data,
        localPort,
        remoteAddress,
        timestamp: Date.now()
      }
      // Dump the raw packet
      this.logger.info(
        "rawPacket's data prior to proccessing",
        { data: rawPacket.data.toString('hex') }

      )
      let newConnection = connection
      try {
        newConnection = await connection.mgr.processData(rawPacket, config)
      } catch (error) {
        throw new Error(`Error in listenerThread::onData 1: ${error}`)
      }
      if (!connection.remoteAddress) {
        debug(connection.toString())
        throw new Error('Remote address is empty')
      }
      try {
        await connection.mgr._updateConnectionByAddressAndPort(
          connection.remoteAddress,
          connection.localPort,
          newConnection
        )
      } catch (error) {
        throw new Error(`Error in listenerThread::onData 2: ${error}`)
      }
    } catch (error) {
      throw new Error(`Error in listenerThread::onData 3: ${error}`)
    }
  }

  /**
   * server listener method
   *
   * @param {net.Socket} socket
   * @param {module:ConnectionMgr} connectionMgr
   * @param {module:IServerConfig} config
   * @memberof ListenerThread
   */
  _listener (socket, connectionMgr, config) {
    // Received a new connection
    // Turn it into a connection object
    const connection = connectionMgr.findOrNewConnection(socket)

    const { localPort, remoteAddress } = socket
    this.logger.info(`Client ${remoteAddress} connected to port ${localPort}`)
    if (socket.localPort === 7003 && connection.inQueue) {
      /**
       * Debug seems hard-coded to use the connection queue
       * Craft a packet that tells the client it's allowed to login
       */

      socket.write(Buffer.from([0x02, 0x30, 0x00, 0x00]))
      connection.inQueue = false
    }
    socket.on('end', () => {
      this.logger.info(
        `Client ${remoteAddress} disconnected from port ${localPort}`
      )
    })
    socket.on('data', data => {
      this._onData(data, connection, config)
    })
    socket.on('error', err => {
      if (!err.message.includes('ECONNRESET')) {
        this.logger.error(`Socket error: ${err}`)
      }
    })
  }

  /**
   * Given a port and a connection manager object,
   * create a new TCP socket listener for that port
   *
   * @export
   * @param {number} localPort
   * @param {module:ConnectionMgr} connectionMgr
   * @param {module:IServerConfig} config
   * @return {Promise<net.Server>}
   * @memberof! ListenerThread
   */
  async startTCPListener (localPort, connectionMgr, config) {
    return net
      .createServer(socket => {
        this._listener(socket, connectionMgr, config)
      })
      .listen({ port: localPort, host: '0.0.0.0' })
  }
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason)
  console.trace()
  // application specific logging, throwing an error, or other logic here
})
