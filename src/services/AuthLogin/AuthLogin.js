// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const debug = require('debug')('mcoserver:AuthLogin')
const fs = require('fs')
const https = require('https')
const { logger } = require('../../shared/logger')
const util = require('util')
const { appSettings } = require('../../../config/app-settings')
// This section of the server can not be encrypted. This is an intentional choice for compatibility
// deepcode ignore HttpToHttps: This is intentional. See above note.
const { IncomingMessage, ServerResponse } = require('http')
const { Socket } = require('net')

const readFilePromise = util.promisify(fs.readFile)

/**
 * @class
 * @property {appSettings} config
 * @property {logger} logger
 */
class AuthLogin {
  /**
   *
   * @param {appSettings} config
   */
  constructor(config) {
    this.config = config
    this.logger = logger.child({ service: 'mcoserver:AuthLogin' })
  }

  /**
   *
   * @global
   * @typedef {Object} sslOptionsObj
   * @property {string} cert
   * @property {boolean} honorCipherOrder
   * @property {string} key
   * @property {boolean} rejectUnauthorized
   */

  /**
   *
   * @param {import('../../../config/app-settings').IServerConfig} configuration
   * @returns {Promise<sslOptionsObj>}
   * @memberof! WebServer
   */
  async _sslOptions(configuration) {
    debug(`Reading ${configuration.certFilename}`)

    let cert
    let key

    try {
      cert = await readFilePromise(configuration.certFilename, { encoding: "utf-8" })
    } catch (error) {
      throw new Error(
        `Error loading ${configuration.certFilename}, server must quit!`
      )
    }

    try {
      key = await readFilePromise(configuration.privateKeyFilename, { encoding: "utf-8" })
    } catch (error) {
      throw new Error(
        `Error loading ${configuration.privateKeyFilename}, server must quit!`
      )
    }

    return {
      cert,
      honorCipherOrder: true,
      key,
      rejectUnauthorized: false
    }
  }

  /**
   *
   * @return {string}
   * @memberof! WebServer
   */
  _handleGetTicket() {
    return 'Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e'
  }


  /**
   *
   * @param {IncomingMessage} request
   * @param {ServerResponse} response
   * @memberof! WebServer
   */
  // file deepcode ignore NoRateLimitingForExpensiveWebOperation: Not using express, unsure how to handle rate limiting on raw http
  _httpsHandler(request, response) {
    this.logger.info(
      `[Web] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`
    )
    if (request.url && request.url.startsWith('/AuthLogin')) {
      response.setHeader('Content-Type', 'text/plain')
      return response.end(this._handleGetTicket())
    }

    return response.end('Unknown request.')
  }

  /**
   * 
   * @param {Socket} socket
   */
  _socketEventHandler(socket) {
    socket.on('error', (error) => {
      throw new Error(`[AuthLogin] SSL Socket Error: ${error.message}`)
    })
  }

  /**
   *
   * @memberof! WebServer
   */
  async start() {
    const sslOptions = await this._sslOptions(this.config.serverConfig)

    try {
      this.httpsServer = await https
        .createServer(
          sslOptions,
          (req, res) => {
            this._httpsHandler(req, res)
          }
        )
        .listen({ port: 443, host: '0.0.0.0' }, () => {
          debug('port 443 listening')
        })

    } catch (error) {
      if (error.code === "EACCES") {
        logger.error(`Unable to start server on port 443! Have you granted access to the node runtime?`)
        process.exit(-1)
      }
      throw error
    }
    this.httpsServer.on('connection', this._socketEventHandler)
    this.httpsServer.on('tlsClientError', error => {
      debug(`[AuthLogin] SSL Socket Client Error: ${error.message}`)
      // throw new Error(`[AuthLogin] SSL Socket Client Error: ${error.message}`)
    })
    return this.httpsServer
  }
}

module.exports = {
  WebServer: AuthLogin
}
