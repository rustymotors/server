import { logger } from 'mcos-shared/logger'
import http from 'node:http'
import { createServer } from 'node:net'
import { ConnectionManager } from './connection-mgr.js'
import { httpListener } from './httpListener.js'
import { ListenerThread } from './listener-thread.js'
export { ConnectionManager, getConnectionManager } from './connection-mgr.js'
export { EncryptionManager } from './encryption-mgr.js'
export { TCPConnection } from './tcpConnection.js'

const log = logger.child({ service: 'mcos' })

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
 * Primary server class
 *
 * @export
 * @class MCOServer
 */
export class MCOServer {
  /**
   *
   * @private
   * @type {import('mcos-shared/types').ICoreConfig}
   * @memberof MCOServer
   */
  _config

  /**
   *
   * @private
   * @type {boolean}
   * @memberof MCOServer
   */

  _running = false
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
      `Connection from ${incomingSocket.remoteAddress} on port ${incomingSocket.localPort}`
    )

    // Is this an http request?
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
   * Is the server in a running state?
   *
   * @readonly
   * @type {boolean}
   * @return {boolean}
   * @memberof MCOServer
   */
  get isRunning () {
    return this._running
  }

  /**
   * Get the number of listening servers
   *
   * @readonly
   * @return {number}
   * @memberof MCOServer
   */
  get serverCount () {
    return this._listeningServers.length
  }

  /**
   * Creates an instance of MCOServer.
   *
   * Please use {@link MCOServer.init()} instead
   * @param {import('mcos-shared/types').ICoreConfig} config
   * @memberof MCOServer
   */
  constructor (config) {
    this._config = config
  }

  /**
   * Get an instance of the primary server
   *
   * @static
   * @param {import('mcos-shared/types').ICoreConfig} config
   * @return {MCOServer}
   * @memberof MCOServer
   */
  static init (config) {
    return new MCOServer(config)
  }

  /**
   * Start port listeners and ,move server to running state
   *
   * @return {void}
   * @memberof MCOServer
   */
  run () {
    log.info('Server starting')

    if (typeof this._config.ports === 'undefined') {
      throw new Error('No listening ports were passed')
    }

    for (let index = 0; index < this._config.ports.length; index++) {
      const port = this._config.ports[index]
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
