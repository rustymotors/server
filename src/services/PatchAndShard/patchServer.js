// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// deepcode ignore HttpToHttps: This section of the server is not encrypted
const http = require('http')
const { ShardEntry } = require('./ShardEntry')
const { ConfigManager } = require('../shared/configManager')
const { Logger } = require('../shared/loggerManager')

/**
 * A simulated patch server response
 */
const CastanetResponse = {
  body: Buffer.from('cafebeef00000000000003', 'hex'),
  header: {
    type: 'Content-Type',
    value: 'application/octet-stream'
  }
}

class PatchServer {
  constructor () {
    this.config = new ConfigManager('./src/services/shared/config.json').getConfig()
    this.logger = new Logger().getLogger('PatchServer')
    /** @type {string[]} */
    this.banList = []
    /** @type {ShardEntry[]} */
    this.possibleShards = []
  }

  /**
   * Simulate a response from a update server
   *
   * @return {CastanetResponse}
   * @memberof! PatchServer
   */
  _patchUpdateInfo () {
    return CastanetResponse
  }

  /**
   * Simulate a response from a patch server
   *
   * @return {CastanetResponse}
   * @memberof! PatchServer
   */
  _patchNPS () {
    return CastanetResponse
  }

  /**
   * Simulate a response from a patch server
   *
   * @return {CastanetResponse}
   * @memberof! PatchServer
   */
  _patchMCO () {
    return CastanetResponse
  }

  /**
   * Generate a shard list web document
   *
   * @return {string}
   * @memberof! PatchServer
   */
  _generateShardList () {
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
      80
    )

    this.possibleShards.push(shardTwinPinesMall.formatForShardList())

    /** @type {ShardEntry[]} */
    const activeShardList = []
    activeShardList.push(shardClockTower.formatForShardList())

    return activeShardList.join('\n')
  }

  /**
   *
   * @param {IncomingMessage} request
   * @param {ServerResponse} response
   * @memberof! PatchServer
   */
  _httpHandler (
    request,
    response
  ) {
    let responseData
    switch (request.url) {
      case '/ShardList/':
        response.setHeader('Content-Type', 'text/plain')
        response.end(this._generateShardList())
        break

      case '/games/EA_Seattle/MotorCity/UpdateInfo':
        responseData = this._patchUpdateInfo()
        response.setHeader(responseData.header.type, responseData.header.value)
        response.end(responseData.body)
        break
      case '/games/EA_Seattle/MotorCity/NPS':
        responseData = this._patchNPS()
        response.setHeader(responseData.header.type, responseData.header.value)
        response.end(responseData.body)
        break
      case '/games/EA_Seattle/MotorCity/MCO':
        responseData = this._patchMCO()
        response.setHeader(responseData.header.type, responseData.header.value)
        response.end(responseData.body)
        break

      default:
        // Is this a hacker?
        if (this.banList.indexOf(request.socket.remoteAddress) < 0) {
          // In ban list, skip
          break
        }
        // Unknown request, log it
        this.logger.info(
          `[PATCH] Unknown Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}, banning.`
        )
        this.banList.push(request.socket.remoteAddress)
        response.end('foo')
        break
    }
  }

  /**
   *
   * @return {string[]}
   * @memberof! PatchServer
   */
  _getBans () {
    return this.banList
  }

  /**
   *
   * @memberof! PatchServer
   */
  async start () {
    const serverPatch = http.createServer((req, res) => {
      this._httpHandler(req, res)
    })
    serverPatch.listen({ port: '80', host: '0.0.0.0' }, () => {
      this.logger.info('[patchServer] Patch server is listening...')
    })
  }
}

module.exports = {
  CastanetResponse,
  PatchServer
}
