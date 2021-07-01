// @ts-check
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { createServer } from 'https'
import { debug, log } from '@drazisil/mco-logger'
import config from '../../../config/index.js'
import { _sslOptions } from '../@drazisil/ssl-options.js'

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
class AuthLogin {
  constructor() {
    this.config = config
    this.serviceName = 'mcoserver:AuthLogin'
  }

  /**
   *
   * @return {string}
   * @memberof! WebServer
   */
  _handleGetTicket() {
    return 'Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e'
  }

  // File deepcode ignore NoRateLimitingForExpensiveWebOperation: Not using express, unsure how to handle rate limiting on raw http
  /**
   * @returns {void}
   * @memberof ! WebServer
   * @param {import("http").IncomingMessage} request
   * @param {import("http").ServerResponse} response
   */
  _httpsHandler(request, response) {
    log(
      `[Web] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`,
      { service: this.serviceName },
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
  _socketEventHandler(socket) {
    socket.on('error', (/** @type {{ message: any; }} */ error) => {
      throw new Error(`[AuthLogin] SSL Socket Error: ${error.message}`)
    })
  }

  /**
   *
   * @returns {Promise<import("https").Server>}
   * @memberof! WebServer
   */
  async start() {
    const sslOptions = await _sslOptions(
      this.config.certificate,
      this.serviceName,
    )

    try {
      this.httpsServer = createServer(sslOptions, (request, response) => {
        this._httpsHandler(request, response)
      }).listen({ port: 443, host: '0.0.0.0' }, () => {
        debug('port 443 listening', { service: this.serviceName })
      })
    } catch (error) {
      if (error.code === 'EACCES') {
        process.exitCode = -1
        throw new Error(
          'Unable to start server on port 443! Have you granted access to the node runtime?',
        )
      }

      throw error
    }

    this.httpsServer.on('connection', this._socketEventHandler)
    this.httpsServer.on('tlsClientError', error => {
      log(`[AuthLogin] SSL Socket Client Error: ${error.message}`, {
        service: this.serviceName,
        level: 'warn',
      })
    })
    return this.httpsServer
  }
}
const _AuthLogin = AuthLogin
export { _AuthLogin as AuthLogin }
