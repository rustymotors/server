/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-check
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Logger } from '@drazisil/mco-logger'
import { createServer, Server } from 'https'
import config from '../../config/index.js'
import { _sslOptions } from '../@drazisil/ssl-options.js'
import { MCServer } from '../../packages/core/index.js'

const { log } = Logger.getInstance()
/**
 * SSL web server for managing the state of the system
 */

/**
 *
 * @property {config} config
 * @property {MCServer} mcServer
 * @property {Server} httpServer
 */
export class AdminServer {
  /**
   * @type {AdminServer}
   */
  static _instance
  config
  mcServer
  serviceName
  /**
   * @type {Server | undefined}
   */
  httpsServer

  /**
   * @param {MCServer} mcServer
   */
  static getInstance(mcServer) {
    if (!AdminServer._instance) {
      AdminServer._instance = new AdminServer(mcServer, false)
    }
    return AdminServer._instance
  }

  /**
   * @param {MCServer} mcServer
   */
  constructor(mcServer, isNew = true) {
    if (isNew) {
      throw new Error('Please use getInstance()')
    }
    this.config = config
    this.mcServer = mcServer
    this.serviceName = 'mcoserver:AdminServer;'
  }

  /**
   *
   * @return {string}
   */
  _handleGetConnections() {
    const connections = this.mcServer.mgr.dumpConnections()
    let responseText = ''
    for (const [index, connection] of connections.entries()) {
      const displayConnection = `
        index: ${index} - ${connection.id}
            remoteAddress: ${connection.remoteAddress}:${connection.localPort}
            Encryption ID: ${connection.enc.getId()}
            inQueue:       ${connection.inQueue}
        `
      responseText += displayConnection
    }

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
    for (const [index, connection] of connections.entries()) {
      const displayConnection = `
        index: ${index} - ${connection.id}
            remoteAddress: ${connection.remoteAddress}:${connection.localPort}
            Encryption ID: ${connection.enc.getId()}
            inQueue:       ${connection.inQueue}
        `
      responseText += displayConnection
    }

    return responseText
  }

  /**
   * @return {void}
   * @param {import("http").IncomingMessage} request
   * @param {import("http").ServerResponse} response
   */
  _httpsHandler(request, response) {
    log(
      'info',
      `[Admin] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`,
      { service: 'mcoserver:AdminServer' },
    )
    log(
      'info',
      `Requested recieved,
      ${JSON.stringify({
        url: request.url,
        remoteAddress: request.socket.remoteAddress,
      })}`,
      { service: 'mcoserver:AdminServer' },
    )
    switch (request.url) {
      case '/admin/connections':
        response.setHeader('Content-Type', 'text/plain')
        return response.end(this._handleGetConnections())

      case '/admin/connections/resetAllQueueState':
        response.setHeader('Content-Type', 'text/plain')
        return response.end(this._handleResetAllQueueState())

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
   * @returns {void}
   * @param {import("net").Socket} socket
   */
  _socketEventHandler(socket) {
    socket.on('error', error => {
      throw new Error(`[AdminServer] SSL Socket Error: ${error.message}`)
    })
  }

  /**
   *
   * @return {Server}
   */
  start() {
    const config = this.config
    try {
      const sslOptions = _sslOptions(config.certificate, this.serviceName)

      /** @type {import("https").Server} */
      this.httpsServer = createServer(sslOptions, (request, response) => {
        this._httpsHandler(request, response)
      })
    } catch (err) {
      if (err instanceof Error) {
        const error = err
        throw new Error(`${error.message}, ${error.stack}`)
      }
    }

    if (this.httpsServer === undefined) {
      throw new Error('Error creating the Admin Srver instance!')
    }
    this.httpsServer.on('connection', this._socketEventHandler)

    return this.httpsServer.listen({ port: 88, host: '0.0.0.0' }, () => {
      log('debug', 'port 88 listening', {
        service: 'mcoserver:AdminServer',
      })
    })
  }
}
