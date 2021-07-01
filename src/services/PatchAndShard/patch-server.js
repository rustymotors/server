// @ts-check
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// This section of the server can not be encrypted. This is an intentional choice for compatibility
// deepcode ignore HttpToHttps: This is intentional. See above note.
import { readFileSync } from 'fs'
import { createServer } from 'http'
import { debug, log } from '@drazisil/mco-logger'
import config from '../../../config/index.js'
import { ShardEntry } from './shard-entry.js'

/**
 * Manages patch and update server connections
 * Also handles the shard list, and some utility endpoints
 * TODO: Document the endpoints
 * @module PatchServer
 */

/**
 * @typedef ICastanetResponseHeader
 * @property {string} type
 * @property {string} value
 */

/**
 * @typedef ICastanetResponse
 * @property {Buffer} body
 * @property {ICastanetResponseHeader} header
 */

/**
 * A simulated patch server response
 * @type {ICastanetResponse}
 */
export const CastanetResponse = {
  body: Buffer.from('cafebeef00000000000003', 'hex'),
  header: {
    type: 'Content-Type',
    value: 'application/octet-stream',
  },
}

/**
 * @class
 * @property {config.config} config
 * @property {string[]} banList
 * @property {string[]} possibleShards
 * @property {Server} serverPatch
 */
export class PatchServer {
  constructor() {
    this.config = config
    /**
     * @type {string[]}
     */
    this.banList = []
    /**
     * @type {string[]}
     */
    this.possibleShards = []

    this.serverPatch = createServer((request, response) => {
      this._httpHandler(request, response)
    })
    this.serverPatch.on('error', error => {
      if (error.message.includes('EACCES')) {
        process.exitCode = -1
        throw new Error(
          'Unable to start server on port 80! Have you granted access to the node runtime?',
        )
      }

      throw error
    })
    this.serviceName = 'mcoserver:PatchServer'
  }

  /**
   * Simulate a response from a update server
   *
   * @return {ICastanetResponse}
   * @memberof! PatchServer
   */
  _patchUpdateInfo() {
    return CastanetResponse
  }

  /**
   * Simulate a response from a patch server
   *
   * @return {ICastanetResponse}
   * @memberof! PatchServer
   */
  _patchNPS() {
    return CastanetResponse
  }

  /**
   * Simulate a response from a patch server
   *
   * @return {ICastanetResponse}
   * @memberof! PatchServer
   */
  _patchMCO() {
    return CastanetResponse
  }

  /**
   * Generate a shard list web document
   *
   * @return {string}
   * @memberof! PatchServer
   */
  _generateShardList() {
    const { ipServer } = this.config.serverSettings
    const shardClockTower = new ShardEntry(
      'The Clocktower',
      'The Clocktower',
      44,
      ipServer,
      8226,
      ipServer,
      7003,
      ipServer,
      0,
      '',
      'Group-1',
      88,
      2,
      ipServer,
      80,
    )

    this.possibleShards.push(shardClockTower.formatForShardList())

    const shardTwinPinesMall = new ShardEntry(
      'Twin Pines Mall',
      'Twin Pines Mall',
      88,
      ipServer,
      8226,
      ipServer,
      7003,
      ipServer,
      0,
      '',
      'Group-1',
      88,
      2,
      ipServer,
      80,
    )

    this.possibleShards.push(shardTwinPinesMall.formatForShardList())

    /** @type {string[]} */
    const activeShardList = []
    activeShardList.push(shardClockTower.formatForShardList())

    return activeShardList.join('\n')
  }

  /**
   *
   * @return {string}
   * @memberof! WebServer
   */
  _handleGetCert() {
    return readFileSync(this.config.certificate.certFilename).toString()
  }

  /**
   *
   * @return {string}
   * @memberof! WebServer
   */
  _handleGetKey() {
    return readFileSync(this.config.certificate.publicKeyFilename).toString()
  }

  /**
   *
   * @return {string}
   * @memberof! WebServer
   */
  _handleGetRegistry() {
    const { ipServer } = this.config.serverSettings
    const dynamicRegistryFile = `Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\EACom\\AuthAuth]
"AuthLoginBaseService"="AuthLogin"
"AuthLoginServer"="${ipServer}"

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Electronic Arts\\Motor City]
"GamePatch"="games/EA_Seattle/MotorCity/MCO"
"UpdateInfoPatch"="games/EA_Seattle/MotorCity/UpdateInfo"
"NPSPatch"="games/EA_Seattle/MotorCity/NPS"
"PatchServerIP"="${ipServer}"
"PatchServerPort"="80"
"CreateAccount"="${ipServer}/SubscribeEntry.jsp?prodID=REG-MCO"
"Language"="English"

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Electronic Arts\\Motor City\\1.0]
"ShardUrl"="http://${ipServer}/ShardList/"
"ShardUrlDev"="http://${ipServer}/ShardList/"

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Electronic Arts\\Motor City\\AuthAuth]
"AuthLoginBaseService"="AuthLogin"
"AuthLoginServer"="${ipServer}"

[HKEY_LOCAL_MACHINE\\Software\\WOW6432Node\\Electronic Arts\\Network Play System]
"Log"="1"

`
    return dynamicRegistryFile
  }

  /**
   * @return {void}
   * @memberof ! PatchServer
   * @param {import("http").IncomingMessage} request
   * @param {import("http").ServerResponse} response
   */
  _httpHandler(request, response) {
    let responseData

    if (request.url === '/cert') {
      response.setHeader('Content-disposition', 'attachment; filename=cert.pem')
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

    switch (request.url) {
      case '/ShardList/':
        debug(
          `[PATCH] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`,
          { service: this.serviceName },
        )

        response.setHeader('Content-Type', 'text/plain')
        response.end(this._generateShardList())
        break

      case '/games/EA_Seattle/MotorCity/UpdateInfo':
        log(
          `[PATCH] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`,
          { service: this.serviceName },
        )

        responseData = this._patchUpdateInfo()
        response.setHeader(responseData.header.type, responseData.header.value)
        response.end(responseData.body)
        break
      case '/games/EA_Seattle/MotorCity/NPS':
        log(
          `[PATCH] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`,
          { service: this.serviceName },
        )

        responseData = this._patchNPS()
        response.setHeader(responseData.header.type, responseData.header.value)
        response.end(responseData.body)
        break
      case '/games/EA_Seattle/MotorCity/MCO':
        log(
          `[PATCH] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`,
          { service: this.serviceName },
        )
        responseData = this._patchMCO()
        response.setHeader(responseData.header.type, responseData.header.value)
        response.end(responseData.body)
        break

      default:
        // Is this a hacker?
        response.statusCode = 404
        response.end('')

        // Unknown request, log it
        log(
          `[PATCH] Unknown Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`,
          { service: this.serviceName },
        )
        break
    }
  }

  /**
   *
   * @param {string} banIP
   * @return {void}
   * @memberof! PatchServer
   */
  _addBan(banIP) {
    this.banList.push(banIP)
  }

  /**
   *
   * @return {string[]}
   * @memberof! PatchServer
   */
  _getBans() {
    return this.banList
  }

  /**
   *
   * @return {void}
   * @memberof! PatchServer
   */
  _clearBans() {
    this.banList = []
  }

  /**
   *
   * @memberof! PatchServer
   * @return {Promise<import("http").Server>}
   */
  async start() {
    const { serviceName } = this
    return this.serverPatch.listen({ port: '80', host: '0.0.0.0' }, () => {
      debug('port 80 listening', { service: serviceName })
      log('[patchServer] Patch server is listening...', {
        service: serviceName,
      })
    })
  }
}
