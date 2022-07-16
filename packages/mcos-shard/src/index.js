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
import { readFileSync } from 'node:fs'
import { ShardEntry } from './shard-entry.js'
import { createServer } from 'node:https'

// This section of the server can not be encrypted. This is an intentional choice for compatibility
// deepcode ignore HttpToHttps: This is intentional. See above note.
const log = logger.child({ service: 'MCOServer:Shard' })

/**
 * Manages patch and update server connections
 * Also handles the shard list, and some utility endpoints
 * TODO: Document the endpoints
 */

/**
 *
 *
 * @export
 * @class ShardServer
 */
export class ShardServer {
  /**
   *
   *
   * @static
   * @type {ShardServer}
   * @memberof ShardServer
   */
  static instance

  /**
   *
   *
   * @private
   * @type {import("node:http").Server}
   * @memberof ShardServer
   */
  _server

  /**
   * Return the instance of the ShardServer class
   * @returns {ShardServer}
   */
  static getInstance () {
    if (typeof ShardServer.instance === 'undefined') {
      ShardServer.instance = new ShardServer()
    }
    return ShardServer.instance
  }

  /**
   * Creates an instance of ShardServer.
   *
   * Please use {@link ShardServer.getInstance()} instead
   * @memberof ShardServer
   */
  constructor () {
    this._server = createServer(this.handleRequest.bind(this))
    /** @type {string[]} */
    this._possibleShards = []

    this._server.on('error', (error) => {
      process.exitCode = -1
      log.error(`Server error: ${error.message}`)
      log.info(`Server shutdown: ${process.exitCode}`)
      process.exit()
    })
  }

  /**
   * Generate a shard list web document
   *
   * @private
   * @return {string}
   * @memberof! PatchServer
   */
  _generateShardList () {
    if (typeof process.env.EXTERNAL_HOST === 'undefined') {
      throw new Error('Please set EXTERNAL_HOST')
    }
    const shardHost = process.env.EXTERNAL_HOST
    const shardClockTower = new ShardEntry(
      'The Clocktower',
      'The Clocktower',
      44,
      shardHost,
      8226,
      shardHost,
      7003,
      shardHost,
      0,
      '',
      'Group-1',
      88,
      2,
      shardHost,
      80
    )

    this._possibleShards.push(shardClockTower.formatForShardList())

    const shardTwinPinesMall = new ShardEntry(
      'Twin Pines Mall',
      'Twin Pines Mall',
      88,
      shardHost,
      8226,
      shardHost,
      7003,
      shardHost,
      0,
      '',
      'Group-1',
      88,
      2,
      shardHost,
      80
    )

    this._possibleShards.push(shardTwinPinesMall.formatForShardList())

    /** @type {string[]} */
    const activeShardList = []
    activeShardList.push(shardClockTower.formatForShardList())

    return activeShardList.join('\n')
  }

  /**
   *
   * @private
   * @return {string}
   * @memberof! WebServer
   */
  _handleGetCert () {
    if (typeof process.env.CERTIFICATE_FILE === 'undefined') {
      throw new Error('Pleas set CERTIFICATE_FILE')
    }
    return readFileSync(
      process.env.CERTIFICATE_FILE
    ).toString()
  }

  /**
   *
   * @private
   * @return {string}
   * @memberof! WebServer
   */
  _handleGetKey () {
    if (typeof process.env.PUBLIC_KEY_FILE === 'undefined') {
      throw new Error('Please set PUBLIC_KEY_FILE')
    }
    return readFileSync(
      process.env.PUBLIC_KEY_FILE
    ).toString()
  }

  /**
   *
   * @private
   * @return {string}
   * @memberof! WebServer
   */
  _handleGetRegistry () {
    if (typeof process.env.EXTERNAL_HOST === 'undefined') {
      throw new Error('Please set EXTERNAL_HOST')
    }
    const externalHost = process.env.EXTERNAL_HOST
    const patchHost = externalHost
    const authHost = externalHost
    const shardHost = externalHost
    return `Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\EACom\\AuthAuth]
"AuthLoginBaseService"="AuthLogin"
"AuthLoginServer"="${authHost}"

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Electronic Arts\\Motor City]
"GamePatch"="games/EA_Seattle/MotorCity/MCO"
"UpdateInfoPatch"="games/EA_Seattle/MotorCity/UpdateInfo"
"NPSPatch"="games/EA_Seattle/MotorCity/NPS"
"PatchServerIP"="${patchHost}"
"PatchServerPort"="80"
"CreateAccount"="${authHost}/SubscribeEntry.jsp?prodID=REG-MCO"
"Language"="English"

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Electronic Arts\\Motor City\\1.0]
"ShardUrl"="http://${shardHost}/ShardList/"
"ShardUrlDev"="http://${shardHost}/ShardList/"

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Electronic Arts\\Motor City\\AuthAuth]
"AuthLoginBaseService"="AuthLogin"
"AuthLoginServer"="${authHost}"

[HKEY_LOCAL_MACHINE\\Software\\WOW6432Node\\Electronic Arts\\Network Play System]
"Log"="1"

`
  }

  /**
   * Handle incoming http requests
   * @return {import("node:http").ServerResponse}
   * @param {import("http").IncomingMessage} request
   * @param {import("http").ServerResponse} response
   */
  // deepcode ignore NoRateLimitingForExpensiveWebOperation: Very unlikely to be DDos'ed
  handleRequest (request, response) {
    if (request.url === '/cert') {
      response.setHeader(
        'Content-disposition',
        'attachment; filename=cert.pem'
      )
      return response.end(this._handleGetCert())
    }

    if (request.url === '/key') {
      response.setHeader('Content-disposition', 'attachment; filename=pub.key')
      return response.end(this._handleGetKey())
    }

    if (request.url === '/registry') {
      response.setHeader('Content-disposition', 'attachment; filename=mco.reg')
      return response.end(this._handleGetRegistry())
    }

    if (request.url === '/') {
      response.statusCode = 404
      return response.end('Hello, world!')
    }

    if (request.url === '/ShardList/') {
      log.debug(
        `Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`
      )

      response.setHeader('Content-Type', 'text/plain')
      return response.end(this._generateShardList())
    }

    // Is this a hacker?
    response.statusCode = 404
    response.end('')

    // Unknown request, log it
    log.info(
      `Unknown Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`
    )
    return response
  }

  /**
   * Start the shard server listener
   * @returns {import("node:http").Server}
   */
  start () {
    const host = '0.0.0.0'
    const port = 80
    log.debug(`Attempting to bind to port ${port}`)
    return this._server.listen({ port, host }, () => {
      log.debug(`port ${port} listening`)
      log.info('Shard server is listening...')
    })
  }
}
