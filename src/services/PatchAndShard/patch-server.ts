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
import { createServer, IncomingMessage, Server, ServerResponse } from 'http'
import logger from '@drazisil/mco-logger'
import config, { IAppConfiguration } from '../../../config/index'
import { ShardEntry } from './shard-entry'

/**
 * Manages patch and update server connections
 * Also handles the shard list, and some utility endpoints
 * TODO: Document the endpoints
 * @module PatchServer
 */

interface ICastanetResponse {
  body: Buffer
  header: {
    type: string
    value: string
  }
}

/**
 * A simulated patch server response
 * @type {ICastanetResponse}
 */
export const CastanetResponse: ICastanetResponse = {
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
export class PatchAndShardServer {
  static _instance: PatchAndShardServer
  config: IAppConfiguration
  banList: string[]
  possibleShards: string[]
  serverPatch: Server | undefined
  serviceName: string

  static getInstance(): PatchAndShardServer {
    if (!PatchAndShardServer._instance) {
      PatchAndShardServer._instance = new PatchAndShardServer()
    }
    return PatchAndShardServer._instance
  }

  private constructor() {
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
  _patchUpdateInfo(): ICastanetResponse {
    return CastanetResponse
  }

  /**
   * Simulate a response from a patch server
   *
   * @return {ICastanetResponse}
   * @memberof! PatchServer
   */
  _patchNPS(): ICastanetResponse {
    return CastanetResponse
  }

  /**
   * Simulate a response from a patch server
   *
   * @return {ICastanetResponse}
   * @memberof! PatchServer
   */
  _patchMCO(): ICastanetResponse {
    return CastanetResponse
  }

  /**
   * Generate a shard list web document
   *
   * @return {string}
   * @memberof! PatchServer
   */
  _generateShardList(): string {
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
    const activeShardList: string[] = []
    activeShardList.push(shardClockTower.formatForShardList())

    return activeShardList.join('\n')
  }

  /**
   *
   * @return {string}
   * @memberof! WebServer
   */
  _handleGetCert(): string {
    return readFileSync(this.config.certificate.certFilename).toString()
  }

  /**
   *
   * @return {string}
   * @memberof! WebServer
   */
  _handleGetKey(): string {
    return readFileSync(this.config.certificate.publicKeyFilename).toString()
  }

  /**
   *
   * @return {string}
   * @memberof! WebServer
   */
  _handleGetRegistry(): string {
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
  _httpHandler(request: IncomingMessage, response: ServerResponse): void {
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
        logger.debug(
          `[PATCH] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`,
          { service: this.serviceName },
        )

        response.setHeader('Content-Type', 'text/plain')
        response.end(this._generateShardList())
        break

      case '/games/EA_Seattle/MotorCity/UpdateInfo':
        logger.log(
          `[PATCH] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`,
          { service: this.serviceName },
        )

        responseData = this._patchUpdateInfo()
        response.setHeader(responseData.header.type, responseData.header.value)
        response.end(responseData.body)
        break
      case '/games/EA_Seattle/MotorCity/NPS':
        logger.log(
          `[PATCH] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`,
          { service: this.serviceName },
        )

        responseData = this._patchNPS()
        response.setHeader(responseData.header.type, responseData.header.value)
        response.end(responseData.body)
        break
      case '/games/EA_Seattle/MotorCity/MCO':
        logger.log(
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
        logger.log(
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
  _addBan(banIP: string): void {
    this.banList.push(banIP)
  }

  /**
   *
   * @return {string[]}
   * @memberof! PatchServer
   */
  _getBans(): string[] {
    return this.banList
  }

  /**
   *
   * @return {void}
   * @memberof! PatchServer
   */
  _clearBans(): void {
    this.banList = []
  }

  /**
   *
   * @memberof! PatchServer
   * @return {Promise<import("http").Server>}
   */
  async start(): Promise<import('http').Server> {
    const { serviceName } = this
    if (this.serverPatch === undefined) {
      throw new Error('Patch server is not defined')
    }
    return this.serverPatch.listen({ port: '80', host: '0.0.0.0' }, () => {
      logger.debug('port 80 listening', { service: serviceName })
      logger.log('[patchServer] Patch server is listening...', {
        service: serviceName,
      })
    })
  }
}
