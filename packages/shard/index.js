// @ts-check
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
import { Logger } from '@drazisil/mco-logger'
import { readFileSync } from 'fs'
import http from 'http'
import process from 'process'
import { RoutingMesh } from 'router/client'
import { EServerConnectionName } from 'types'
import config from './config.js'

// This section of the server can not be encrypted. This is an intentional choice for compatibility
// deepcode ignore HttpToHttps: This is intentional. See above note.
const { log } = Logger.getInstance()

/**
 * Manages patch and update server connections
 * Also handles the shard list, and some utility endpoints
 * TODO: Document the endpoints
 */

/**
 * @class
 * @property {IServerConfig} config
 * @property {string[]} banList
 * @property {string[]} possibleShards
 * @property {Server} serverPatch
 */
export class ShardServer {
  /**
   * @type {ShardServer}
   */
  static _instance
  _config
  /**
   * @type {string[]}
   */
  _possibleShards = []
  _server
  _serviceName = 'MCOServer:Shard'

  /**
   *
   * @returns {ShardServer}
   */
  static getInstance() {
    if (!ShardServer._instance) {
      ShardServer._instance = new ShardServer(false)
    }
    return ShardServer._instance
  }

  constructor(isNew = true) {
    if (isNew) {
      throw new Error('Please use getInstance()')
    }
    this._config = config

    this._server = http.createServer((request, response) => {
      this._handleRequest(request, response)
    })

    this._server.on('error', error => {
      process.exitCode = -1
      log('error', `Server error: ${error.message}`, {
        service: this._serviceName,
      })
      log('info', `Server shutdown: ${process.exitCode}`, {
        service: this._serviceName,
      })
      process.exit()
    })
  }

  /**
   * Generate a shard list web document
   *
   * @return {string}
   */
  _generateShardList() {
    // const { host } = this._config.serverSettings
    const host = '10.0.0.20'
    /** @type {import('types').ShardEntry} */
    const shardClockTower = {
      name: 'The Clocktower',
      description: 'The Clocktower',
      id: 44,
      loginServerIp: host,
      loginServerPort: 8226,
      lobbyServerIp: host,
      lobbyServerPort: 7003,
      mcotsServerIp: host,
      statusId: 0,
      statusReason: '',
      serverGroupName: 'Group-1',
      population: 88,
      maxPersonasPerUser: 2,
      diagnosticServerHost: host,
      diagnosticServerPort: 80,
    }

    this._possibleShards.push(this.formatForShardList(shardClockTower))

    /** @type {import('types').ShardEntry} */
    const shardTwinPinesMall = {
      name: 'Twin Pines Mall',
      description: 'Twin Pines Mall',
      id: 88,
      loginServerIp: host,
      loginServerPort: 8226,
      lobbyServerIp: host,
      lobbyServerPort: 7003,
      mcotsServerIp: host,
      statusId: 0,
      statusReason: '',
      serverGroupName: 'Group-1',
      population: 88,
      maxPersonasPerUser: 2,
      diagnosticServerHost: host,
      diagnosticServerPort: 80,
    }

    this._possibleShards.push(this.formatForShardList(shardTwinPinesMall))

    /** @type {string[]} */
    const activeShardList = []
    activeShardList.push(this.formatForShardList(shardClockTower))

    return activeShardList.join('\n')
  }

  /**
   *
   * @return {string}
   */
  _handleGetCert() {
    return readFileSync(this._config.certificate.certFilename).toString()
  }

  /**
   *
   * @return {string}
   */
  _handleGetKey() {
    return readFileSync(this._config.certificate.publicKeyFilename).toString()
  }

  /**
   *
   * @return {string}
   */
  _handleGetRegistry() {
    const { host: ipServer } = this._config.serverSettings
    return `Windows Registry Editor Version 5.00

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
  }

  /**
   * @param {import("http").IncomingMessage} request
   * @param {import("http").ServerResponse} response
   * @returns {void}
   */
  _handleRequest(request, response) {
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

    if (request.url === '/ShardList/') {
      log(
        'debug',
        `Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`,
        { service: this._serviceName },
      )

      response.setHeader('Content-Type', 'text/plain')
      return response.end(this._generateShardList())
    }

    // Is this a hacker?
    response.statusCode = 404
    response.end('')

    // Unknown request, log it
    log(
      'info',
      `Unknown Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`,
      { service: this._serviceName },
    )
  }

  /**
   *
   * @returns {import('http').Server}
   */
  start() {
    const host = config.serverSettings.host || 'localhost'
    const port = 82
    return this._server.listen({ port, host }, () => {
      log('debug', `port ${port} listening`, { service: this._serviceName })
      log('info', 'Patch server is listening...', {
        service: this._serviceName,
      })

      // Register service with router
      RoutingMesh.getInstance().registerServiceWithRouter(
        EServerConnectionName.SHARD,
        host,
        port,
      )
    })
  }

  /**
   * @param {import('types').ShardEntry} shardRecord
   * @return {string}
   */
  formatForShardList(shardRecord) {
    return `[${shardRecord.name}]
      Description=${shardRecord.description}
      ShardId=${shardRecord.id}
      LoginServerIP=${shardRecord.loginServerIp}
      LoginServerPort=${shardRecord.loginServerPort}
      LobbyServerIP=${shardRecord.lobbyServerIp}
      LobbyServerPort=${shardRecord.lobbyServerPort}
      MCOTSServerIP=${shardRecord.mcotsServerIp}
      StatusId=${shardRecord.statusId}
      Status_Reason=${shardRecord.statusReason}
      ServerGroup_Name=${shardRecord.serverGroupName}
      Population=${shardRecord.population}
      MaxPersonasPerUser=${shardRecord.maxPersonasPerUser}
      DiagnosticServerHost=${shardRecord.diagnosticServerHost}
      DiagnosticServerPort=${shardRecord.diagnosticServerPort}`
  }
}
