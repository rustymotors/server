// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const net = require('net')
const SDC = require('statsd-client')
const { ConfigManager } = require('../shared/configManager')
const { Logger } = require('../shared/loggerManager')

/**
 *
 */
class ListenerThread {
  /**
   *
   */
  constructor () {
    this.config = new ConfigManager().getConfig()
    this.sdc = new SDC({ host: this.config.statsDHost })
    this.logger = new Logger().getLogger('ListenerThread')
  }

  /**
   * the onData handler
   * takes the data buffer and creates a IRawPacket object
   *
   * @param {Buffer} data
   * @param {ConnectionObj} connection
   * @param {IServerConfiguration} config
   * @memberof! ListenerThread
   */
  async _onData (
    data,
    connection,
    config
  ) {
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
        { data: rawPacket.data.toString('hex') },
        "rawPacket's data prior to proccessing"
      )
      const startPacketHandleTime = new Date()
      let newConnection = connection
      try {
        newConnection = await connection.mgr.processData(rawPacket, config)
      } catch (error) {
        this.logger.error({ error }, 'Error in listenerThread::onData 1:')

        process.exit(-1)
      }
      this.sdc.timing('packet.tcp.process_time', startPacketHandleTime)
      if (!connection.remoteAddress) {
        this.logger.fatal({ connection }, 'Remote address is empty')
        process.exit(-1)
      }
      try {
        await connection.mgr._updateConnectionByAddressAndPort(
          connection.remoteAddress,
          connection.localPort,
          newConnection
        )
      } catch (error) {
        this.logger.error({ error }, 'Error in listenerThread::onData 2:')

        process.exit(-1)
      }
    } catch (error) {
      this.logger.error({ error }, 'Error in listenerThread::onData 3:')
      process.exit(-1)
    }
  }

  /**
   * server listener method
   *
   * @param {Socket} socket
   * @param {ConnectionMgr} connectionMgr
   * @param {IServerConfiguration} config
   * @memberof ListenerThread
   */
  _listener (
    socket,
    connectionMgr,
    config
  ) {
    // Received a new connection
    // Turn it into a connection object
    const connection = connectionMgr.findOrNewConnection(socket)

    const { localPort, remoteAddress } = socket
    this.logger.info(
      `[listenerThread] Client ${remoteAddress} connected to port ${localPort}`
    )
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
        `[listenerThread] Client ${remoteAddress} disconnected from port ${localPort}`
      )
    })
    socket.on('data', (data) => {
      this._onData(data, connection, config)
    })
    socket.on('error', (err) => {
      if (err.code !== 'ECONNRESET') {
        this.logger.error({ err }, 'Socket error')
      }
    })
  }

  /**
   * Given a port and a connection manager object,
   * create a new TCP socket listener for that port
   *
   * @export
   * @param {number} localPort
   * @param {ConnectionMgr} connectionMgr
   * @param {IServerConfiguration} config
   * @memberof! ListenerThread
   */
  async startTCPListener (
    localPort,
    connectionMgr,
    config
  ) {
    net
      .createServer((socket) => {
        this._listener(socket, connectionMgr, config)
      })
      .listen({ port: localPort, host: '0.0.0.0' })
  }
}

module.exports = {
  ListenerThread
}
