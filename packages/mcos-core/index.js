import { logger } from 'mcos-shared/logger'
import http from 'node:http'
import { createServer } from 'node:net'
import { ConnectionManager } from './connection-mgr.js'
import { httpListener } from './httpListener.js'
import { ListenerThread } from './listener-thread.js'
export { ConnectionManager, getConnectionManager } from './connection-mgr.js'
export { EncryptionManager } from './encryption-mgr.js'
export { TCPConnection } from './tcpConnection.js'

const log = logger.child({ service: 'mcos:core' })

const listeningPortList = [
  80, 6660, 7003, 8228, 8226, 8227, 9000, 9001, 9002, 9003, 9004, 9005, 9006,
  9007, 9008, 9009, 9010, 9011, 9012, 9013, 9014, 43200, 43300, 43400, 53303
]

/**
 * Is this an MCOT bound packet?
 *
 * @export
 * @param {Buffer} inputBuffer
 * @return {boolean}
 */
export function isMCOT (inputBuffer) {
  return inputBuffer.toString('utf8', 2, 6) === 'TOMC'
}

/**
 * A server
 *
 * Please use {@link MCOServer.start()}
 * @classdesc
 * @export
 * @class MCOServer
 */
export class MCOServer {
  /**
   *
   * @private
   * @type {import("node:net").Server[]}
   * @memberof MCOServer
   */

  _listeningServers = []

  /**
   * Handle incomming socket connections
   *
   * @private
   * @param {import("node:net").Socket} incomingSocket
   * @return {void}
   * @memberof MCOServer
   */
  _listener (incomingSocket) {
    log.debug(
      `Connection from ${incomingSocket.remoteAddress} on port ${incomingSocket.localPort} in core`
    )

    // Is this an HTTP request?
    if (incomingSocket.localPort === 80) {
      log.debug('Web request')
      const newServer = new http.Server(httpListener)
      // Send the socket to the http server instance
      newServer.emit('connection', incomingSocket)
      return
    }

    // This is a 'normal' TCP socket
    ListenerThread.getInstance().tcpListener(
      incomingSocket,
      ConnectionManager.getConnectionManager()
    )
  }

  /**
   * Launch the server
   *
   * @static
   * @return {void}
   * @memberof MCOServer
   */
  static start () {
    const server = new MCOServer()
    server.run()
  }

  /**
   * Start port listeners
   *
   * @return {void}
   * @memberof MCOServer
   */
  run () {
    log.info('Server starting')

    for (let index = 0; index < listeningPortList.length; index++) {
      const port = listeningPortList[index]
      const newServer = createServer((s) => {
        this._listener(s)
      })
      newServer.on('error', (err) => {
        throw err
      })
      newServer.listen(port, '0.0.0.0', 0, () => {
        log.debug(`Listening on port ${port}`)
        this._listeningServers.push(newServer)
      })
    }
  }

  /**
   * Close all listening ports and move server to stopped state
   *
   * @return {void}
   * @memberof MCOServer
   */
  stop () {
    for (let index = 0; index < this._listeningServers.length; index++) {
      const server = this._listeningServers[index]
      server.emit('close', this)
    }
    this._listeningServers = []
    log.info('Servers closed')
  }
}
