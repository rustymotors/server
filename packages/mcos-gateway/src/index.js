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

import { logger } from 'mcos-shared/logger'
import * as http from 'node:http'
import { createServer } from 'node:net'
import { socketListener } from './sockets.js'
import { httpListener } from './web.js'
export { getAllConnections } from './connections.js'
export { AdminServer } from './adminServer.js'

const log = logger.child({ service: 'mcos:gateway' })

const listeningPortList = [
  80, 6660, 7003, 8228, 8226, 8227, 9000, 9001, 9002, 9003, 9004, 9005, 9006,
  9007, 9008, 9009, 9010, 9011, 9012, 9013, 9014, 43200, 43300, 43400, 53303
]

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
      `[gate]Connection from ${incomingSocket.remoteAddress} on port ${incomingSocket.localPort}`
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
    socketListener(incomingSocket)
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
