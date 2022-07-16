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
import { createServer } from 'node:http'

const log = logger.child({ service: 'MCOServer:Patch' })

export const CastanetResponse = {
  body: Buffer.from('cafebeef00000000000003', 'hex'),
  header: {
    type: 'Content-Type',
    value: 'application/octet-stream'
  }
}

/**
 * The PatchServer class handles HTTP requests from the client for patching and upgrades
 * @class
 * Please use {@link PatchServer.getInstance()} to access
 */
export class PatchServer {
  /**
   * Starts the HTTP listener
   */
  start () {
    const host = '0.0.0.0'
    const port = 80

    const server = createServer()
    server.on('listening', () => {
      const listeningAddress = server.address()
      if (
        typeof listeningAddress !== 'string' &&
        listeningAddress !== null &&
        listeningAddress.port !== undefined
      ) {
        log.info(`Server is listening on port ${listeningAddress.port}`)
      }
    })
    server.on('request', this.handleRequest.bind(this))

    log.debug(`Attempting to bind to port ${port}`)
    server.listen(port, host)
  }

  /**
   *
   *
   * @static
   * @private
   * @type {PatchServer}
   * @memberof PatchServer
   */
  static _instance

  /**
   * Return the instance of the PatchServer class
   *
   * @static
   * @return {PatchServer}
   * @memberof PatchServer
   */
  static getInstance () {
    if (!PatchServer._instance) {
      PatchServer._instance = new PatchServer()
    }
    return PatchServer._instance
  }

  /**
   * Returns the hard-coded value that tells the client there are no updates or patches
   * @param {import("node:http").IncomingMessage} request
   * @param {import("node:http").ServerResponse} response
   * @returns {import("node:http").ServerResponse}
   */
  castanetResponse (request, response) {
    log.debug(
      `[PATCH] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`
    )

    response.setHeader(
      CastanetResponse.header.type,
      CastanetResponse.header.value
    )
    return response.end(CastanetResponse.body)
  }

  /**
   * Routes incomming HTTP requests
   * @param {import("node:http").IncomingMessage} request
   * @param {import("node:http").ServerResponse} response
   * @returns {import("node:http").ServerResponse}
   */
  handleRequest (request, response) {
    if (
      request.url === '/games/EA_Seattle/MotorCity/UpdateInfo' ||
      request.url === '/games/EA_Seattle/MotorCity/NPS' ||
      request.url === '/games/EA_Seattle/MotorCity/MCO'
    ) {
      return this.castanetResponse(request, response)
    }
    response.statusCode = 404
    return response.end('')
  }
}
