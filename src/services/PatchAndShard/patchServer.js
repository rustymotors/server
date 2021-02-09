// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const debug = require('debug')('mcoserver:PatchServer')
const {IAppSettings, appSettings} = require('../../../config/app-settings')
const fs = require('fs')
// This section of the server can not be encrypted. This is an intentional choice for compatibility
// deepcode ignore HttpToHttps: This is intentional. See above note.
const http = require('http')
const { ShardEntry } = require('./ShardEntry')
const util = require('util')
const {logger} = require('../../shared/logger')

const readFilePromise = util.promisify(fs.readFile)

/**
 * A simulated patch server response
 */
exports.CastanetResponse = {
  body: Buffer.from('cafebeef00000000000003', 'hex'),
  header: {
    type: 'Content-Type',
    value: 'application/octet-stream'
  }
}

/**
 * @class
 */
exports.PatchServer = class PatchServer {
  /**
   *
   * @param {logger} logger
   */
  constructor(logger) {
    /** @type { IAppSettings } */
    this.config = appSettings
    this.logger = logger
    /** @type {string[]} */
    this.banList = []
    /** @type {string[]} */
    this.possibleShards = []

    /** @type {http.Server} */
    this.serverPatch = http.createServer((req, res) => {
      this._httpHandler(req, res)
    })
    this.serverPatch.on('error', (err) => {
      if (err.message.includes("EACCES")) {
        logger.error(`Unable to start server on port 80! Have you granted access to the node runtime?`)
        process.exit(-1)
      }
      console.dir(err)
      throw err
    })
  }

  /**
   * Simulate a response from a update server
   *
   * @return {exports.CastanetResponse}
   * @memberof! PatchServer
   */
  _patchUpdateInfo() {
    return exports.CastanetResponse
  }

  /**
   * Simulate a response from a patch server
   *
   * @return exports.CastanetResponse
   * @memberof! PatchServer
   */
  _patchNPS() {
    return exports.CastanetResponse
  }

  /**
   * Simulate a response from a patch server
   *
   * @returns exports.CastanetResponse
   * @memberof! PatchServer
   */
  _patchMCO() {
    return exports.CastanetResponse
  }

  /**
   * Generate a shard list web document
   *
   * @return {string}
   * @memberof! PatchServer
   */
  _generateShardList() {
    const { ipServer } = this.config.serverConfig
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
      80
    )

    this.possibleShards.concat(shardClockTower.formatForShardList())

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
      80
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
    return fs.readFileSync(this.config.serverConfig.certFilename).toString()
  }

  /**
   *
   * @return {string}
   * @memberof! WebServer
   */
  _handleGetKey() {
    return fs.readFileSync(this.config.serverConfig.publicKeyFilename).toString()
  }

  /**
   *
   * @return {string}
   * @memberof! WebServer
   */
  _handleGetRegistry() {
    const dynamicRegistryFile = `Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\EACom\\AuthAuth]
"AuthLoginBaseService"="AuthLogin"
"AuthLoginServer"="${this.config.serverConfig.ipServer}"

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Electronic Arts\\Motor City]
"GamePatch"="games/EA_Seattle/MotorCity/MCO"
"UpdateInfoPatch"="games/EA_Seattle/MotorCity/UpdateInfo"
"NPSPatch"="games/EA_Seattle/MotorCity/NPS"
"PatchServerIP"="${this.config.serverConfig.ipServer}"
"PatchServerPort"="80"
"CreateAccount"="${this.config.serverConfig.ipServer}/SubscribeEntry.jsp?prodID=REG-MCO"
"Language"="English"

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Electronic Arts\\Motor City\\1.0]
"ShardUrl"="http://${this.config.serverConfig.ipServer}/ShardList/"
"ShardUrlDev"="http://${this.config.serverConfig.ipServer}/ShardList/"

[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Electronic Arts\\Motor City\\AuthAuth]
"AuthLoginBaseService"="AuthLogin"
"AuthLoginServer"="${this.config.serverConfig.ipServer}"

[HKEY_LOCAL_MACHINE\\Software\\WOW6432Node\\Electronic Arts\\Network Play System]
"Log"="1"

`
    return dynamicRegistryFile
  }


  /**
   *
   * @param {http.IncomingMessage} request
   * @param {http.ServerResponse} response
   * @memberof! PatchServer
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
      return response.end('Hello, world!')
    }

    switch (request.url) {
      case '/ShardList/':
        this.logger.info(
          `[PATCH] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`
        )

      response.setHeader('Content-Type', 'text/plain')
        response.end(this._generateShardList())
        break

      case '/games/EA_Seattle/MotorCity/UpdateInfo':
        this.logger.info(
          `[PATCH] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`
        )

      responseData = this._patchUpdateInfo()
        response.setHeader(responseData.header.type, responseData.header.value)
        response.end(responseData.body)
        break
      case '/games/EA_Seattle/MotorCity/NPS':
        this.logger.info(
          `[PATCH] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`
        )

      responseData = this._patchNPS()
        response.setHeader(responseData.header.type, responseData.header.value)
        response.end(responseData.body)
        break
      case '/games/EA_Seattle/MotorCity/MCO':
        this.logger.info(
          `[PATCH] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`
        )
        responseData = this._patchMCO()
        response.setHeader(responseData.header.type, responseData.header.value)
        response.end(responseData.body)
        break


      default:
        // Is this a hacker?
        // if (this.banList.indexOf(request.socket.remoteAddress) < 0) {
        response.statusCode = 404
        response.end('')
        // In ban list, skip
        // break
        // }

        // Unknown request, log it
        // response.end('foo')
        this.logger.info(
          `[PATCH] Unknown Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}, banning.`
        )
        // this._addBan(request.socket.remoteAddress)
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
   * @return {Promise<http.Server>}
   */
  async start() {
    await this.serverPatch.listen({ port: '80', host: '0.0.0.0' }, () => {
      debug('port 80 listening')
      this.logger.info('[patchServer] Patch server is listening...')
    })
    return this.serverPatch
  }
}

