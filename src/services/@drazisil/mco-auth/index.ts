// @ts-check
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import https from 'https'
import { Logger } from '@drazisil/mco-logger'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('./server.config.js')
import { IncomingMessage, ServerResponse } from 'http'
import net, { Socket } from 'net'
import { ISslOptions } from '../../../types'
import { readFileSync } from 'fs'
import {
  EServerConnectionAction,
  EServerConnectionName,
  IServerConnection,
} from '../mco-types'
import { RoutingMesh } from '../mco-common'

const { log } = Logger.getInstance()

/**
 * Handles web-based user logins
 * @module AuthLogin
 */

/**
 * @class
 * @property {Object} config
 * @property {Object} config.certificate
 * @property {string} config.certificate.privateKeyFilename
 * @property {string} config.certificate.publicKeyFilename
 * @property {string} config.certificate.certFilename
 * @property {Object} config.serverSettings
 * @property {string} config.serverSettings.ipServer
 * @property {Object} config.serviceConnections
 * @property {string} config.serviceConnections.databaseURL
 * @property {string} config.defaultLogLevel
 * @property {Server} httpsServer
 */
export class AuthLogin {
  static _instance: AuthLogin
  config: typeof config
  _serviceName = 'MCOServer:Auth'

  _server: https.Server

  static getInstance(): AuthLogin {
    if (!AuthLogin._instance) {
      AuthLogin._instance = new AuthLogin()
    }
    return AuthLogin._instance
  }

  private constructor() {
    this.config = config

    this._server = https.createServer(
      this._sslOptions(),
      (request, response) => {
        this.handleRequest(request, response)
      },
    )

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
    this._server.on('tlsClientError', error => {
      log('warn', `[AuthLogin] SSL Socket Client Error: ${error.message}`, {
        service: this._serviceName,
      })
    })
  }

  /**
   *
   * @return {string}
   * @memberof! WebServer
   */
  _handleGetTicket(): string {
    return 'Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e'
  }

  // File deepcode ignore NoRateLimitingForExpensiveWebOperation: Not using express, unsure how to handle rate limiting on raw http
  /**
   * @returns {void}
   * @memberof ! WebServer
   * @param {import("http").IncomingMessage} request
   * @param {import("http").ServerResponse} response
   */
  handleRequest(request: IncomingMessage, response: ServerResponse): void {
    log(
      'info',
      `[Web] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`,
      { service: this._serviceName },
    )
    if (request.url && request.url.startsWith('/AuthLogin')) {
      response.setHeader('Content-Type', 'text/plain')
      return response.end(this._handleGetTicket())
    }

    return response.end('Unknown request.')
  }

  /**
   * @returns {void}
   * @param {import("net").Socket} socket
   */
  _socketEventHandler(socket: Socket): void {
    socket.on('error', error => {
      throw new Error(`[AuthLogin] SSL Socket Error: ${error.message}`)
    })
  }

  /**
   *
   * @returns {Promise<import("https").Server>}
   * @memberof! WebServer
   */
  async start(): Promise<https.Server> {
    const host = config.serverSettings.host || 'localhost'
    const port = config.serverSettings.port || 444
    return this._server.listen({ port, host }, () => {
      log('debug', `port ${port} listening`, {
        service: this._serviceName,
      })
      log('info', 'Auth server listening', {
        service: this._serviceName,
      })

      // Register service with router
      RoutingMesh.registerServiceWithRouter(
        EServerConnectionName.AUTH,
        host,
        port,
      )
    })
  }

  _sslOptions(): ISslOptions {
    log('debug', `Reading ${this.config.certificate.certFilename}`, {
      service: this._serviceName,
    })

    let cert
    let key

    try {
      cert = readFileSync(this.config.certificate.certFilename, {
        encoding: 'utf-8',
      })
    } catch (error) {
      throw new Error(
        `Error loading ${this.config.certificate.certFilename}: (${error}), server must quit!`,
      )
    }

    try {
      key = readFileSync(this.config.certificate.privateKeyFilename, {
        encoding: 'utf-8',
      })
    } catch (error) {
      throw new Error(
        `Error loading ${this.config.certificateSettings.privateKeyFilename}: (${error}), server must quit!`,
      )
    }

    return {
      cert,
      honorCipherOrder: true,
      key,
      rejectUnauthorized: false,
    }
  }
}
