// @ts-check
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// This section of the server can not be encrypted. This is an intentional choice for compatibility
// deepcode ignore HttpToHttps: This is intentional. See above note.
import { Logger } from '@drazisil/mco-logger'
import { readFileSync } from 'fs'
import http from 'http'
import net from 'net'
import {
  EServerConnectionAction,
  EServerConnectionName,
  IServerConnection,
} from '../mco-types'
import { ShardEntry } from './shard-entry'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('./server.config.js')

const { log } = Logger.getInstance()

/**
 * Manages patch and update server connections
 * Also handles the shard list, and some utility endpoints
 * TODO: Document the endpoints
 * @module PatchServer
 */

/**
 * @class
 * @property {config.config} config
 * @property {string[]} banList
 * @property {string[]} possibleShards
 * @property {Server} serverPatch
 */
export class ShardServer {
  static _instance: ShardServer
  _config: typeof config
  _possibleShards: string[] = []
  _server: http.Server
  _serviceName = 'MCOServer:Shard'

  static getInstance(): ShardServer {
    if (!ShardServer._instance) {
      ShardServer._instance = new ShardServer()
    }
    return ShardServer._instance
  }

  private constructor() {
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
   * @memberof! PatchServer
   */
  _generateShardList(): string {
    const { ipServer } = this._config.serverSettings
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

    this._possibleShards.push(shardClockTower.formatForShardList())

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

    this._possibleShards.push(shardTwinPinesMall.formatForShardList())

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
    return readFileSync(this._config.certificate.certFilename).toString()
  }

  /**
   *
   * @return {string}
   * @memberof! WebServer
   */
  _handleGetKey(): string {
    return readFileSync(this._config.certificate.publicKeyFilename).toString()
  }

  /**
   *
   * @return {string}
   * @memberof! WebServer
   */
  _handleGetRegistry(): string {
    const { ipServer } = this._config.serverSettings
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
  _handleRequest(
    request: http.IncomingMessage,
    response: http.ServerResponse,
  ): void {
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
        log(
          'debug',
          `Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`,
          { service: this._serviceName },
        )

        response.setHeader('Content-Type', 'text/plain')
        response.end(this._generateShardList())
        break

      default:
        // Is this a hacker?
        response.statusCode = 404
        response.end('')

        // Unknown request, log it
        log(
          'info',
          `Unknown Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`,
          { service: this._serviceName },
        )
        break
    }
  }

  start(): http.Server {
    const host = config.serverSettings.host || 'localhost'
    const port = config.serverSettings.port || 80
    return this._server.listen({ port, host }, () => {
      log('debug', `port ${port} listening`, { service: this._serviceName })
      log('info', 'Patch server is listening...', {
        service: this._serviceName,
      })

      // Register service with router
      let address: net.AddressInfo
      const netAddress = this._server.address()
      if (netAddress !== null && typeof netAddress !== 'string') {
        address = netAddress
      } else {
        address = { address: '', port: 0, family: '' }
      }

      const payload: IServerConnection = {
        action: EServerConnectionAction.REGISTER_SERVICE,
        service: EServerConnectionName.SHARD,
        host: address.address,
        port: address.port,
      }
      const payloadBuffer = Buffer.from(JSON.stringify(payload))
      this._sendToRouter(payloadBuffer)
    })
  }

  _sendToRouter(data: Buffer): void {
    const client = net.createConnection({ port: 4242 }, () => {
      // 'connect' listener.
      log('debug', 'Connected to RoutingServer', {
        service: this._serviceName,
      })
      client.end(data)
    })
    client.on('data', data => {
      console.log(data.toString())
      client.end()
    })
    client.on('end', () => {
      log('info', 'disconnected from RoutingServer', {
        service: this._serviceName,
      })
    })
  }
}
