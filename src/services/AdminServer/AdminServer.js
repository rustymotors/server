// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const debug = require('debug')('mcoserver:AdminServer')
const { logger } = require('../../shared/logger')
const fs = require('fs')
const https = require('https')
const util = require('util')
const { MCServer } = require('../MCServer')
const { IServerConfig } = require('../../../config/app-settings')
// This section of the server can not be encrypted. This is an intentional choice for compatibility
// deepcode ignore HttpToHttps: This is intentional. See above note.
const { IncomingMessage, ServerResponse } = require('http')
const { Socket } = require('net')
const { TlsOptions } = require('tls')

const readFilePromise = util.promisify(fs.readFile)

/**
 *
 *
 * @property {MCServer} mcServer
 * @property {winston.Logger} logger
 * @property {https.httpServer|undefined} httpServer
 */
class AdminServer {
  /**
   * @class
   * @param {MCServer} mcServer
   */
  constructor(mcServer) {
    this.mcServer = mcServer
    /**
     * @type {logger}
     */
    this.logger = logger.child({ service: 'mcoserver:AdminServer' })
  }

  /**
   * Create the SSL options object
   *
   * @param {IServerConfig} configuration
   * @return {Promise<TlsOptions>}
   */
  async _sslOptions(configuration) {
    debug(`Reading ${configuration.certFilename}`)

    let cert
    let key

    try {
      cert = await readFilePromise(configuration.certFilename)
    } catch (error) {
      throw new Error(
        `Error loading ${configuration.certFilename}, server must quit!`
      )
    }

    try {
      key = await readFilePromise(configuration.privateKeyFilename)
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
   */
  _handleGetBans() {
    const banlist = {
      mcServer: this.mcServer.mgr.getBans()
    }
    return JSON.stringify(banlist)
  }

  /**
   *
   * @return {string}
   */
  _handleGetConnections() {
    const connections = this.mcServer.mgr.dumpConnections()
    let responseText = ''
    connections.forEach((connection, index) => {
      const displayConnection = `
        index: ${index} - ${connection.id}
            remoteAddress: ${connection.remoteAddress}:${connection.localPort}
            Encryption ID: ${connection.enc.getId()}
            inQueue:       ${connection.inQueue}
        `
      responseText += displayConnection
    })
    return responseText
  }

  /**
   *
   * @return {string}
   */
  _handleResetAllQueueState() {
    this.mcServer.mgr.resetAllQueueState()
    const connections = this.mcServer.mgr.dumpConnections()
    let responseText = 'Queue state reset for all connections\n\n'
    connections.forEach((connection, index) => {
      const displayConnection = `
        index: ${index} - ${connection.id}
            remoteAddress: ${connection.remoteAddress}:${connection.localPort}
            Encryption ID: ${connection.enc.getId()}
            inQueue:       ${connection.inQueue}
        `
      responseText += displayConnection
    })
    return responseText
  }

  /**
   *
   * @param {IncomingMessage} request
   * @param {ServerResponse} response
   * @return {any}
   */
  _httpsHandler(request, response) {
    this.logger.info(
      `[Admin] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`
    )
    this.logger.info(
      'Requested recieved',
      {
        url: request.url,
        remoteAddress: request.connection.remoteAddress
      }
    )
    switch (request.url) {
      case '/admin/connections':
        response.setHeader('Content-Type', 'text/plain')
        return response.end(this._handleGetConnections())

      case '/admin/connections/resetAllQueueState':
        response.setHeader('Content-Type', 'text/plain')
        return response.end(this._handleResetAllQueueState())

      case '/admin/bans':
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        return response.end(this._handleGetBans())

      default:
        if (request.url && request.url.startsWith('/admin')) {
          return response.end('Jiggawatt!')
        }
        response.statusCode = 404
        response.end('Unknown request.')
        break
    }
  }

  /**
   * 
   * @param {Socket} socket 
   */
  _socketEventHandler(socket) {
    socket.on('error', error => {
      throw new Error(`[AdminServer] SSL Socket Error: ${error.message}`)
    })
  }

  /**
   *
   * @param {IServerConfig} config
   */
  async start(config) {
    try {
      const sslOptions = await this._sslOptions(config)

      /** @type {https.Server|undefined} */
      this.httpsServer = https.createServer(
        sslOptions,
        (req, res) => {
          this._httpsHandler(req, res)
        }
      )
    } catch (err) {
      throw new Error(`${err.message}, ${err.stack}`)
    }
    this.httpsServer.listen({ port: 88, host: '0.0.0.0' }, () => {
      debug('port 88 listening')
    })
    this.httpsServer.on('connection', this._socketEventHandler)
  }
}

module.exports = {
  AdminServer
}
