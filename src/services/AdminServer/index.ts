// @ts-check
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Logger } from '@drazisil/mco-logger'
import { IncomingMessage, ServerResponse } from 'http'

import { createServer, Server } from 'https'
import { Socket } from 'net'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('./server.config.js')
import { _sslOptions } from '../@drazisil/ssl-options'
import { MCServer } from '../MCServer/index'

const { log } = Logger.getInstance()

interface IRouteEntry {
  uri: string
  method: string
  handler: (req: IncomingMessage, res: ServerResponse) => string
}

export class AdminServer {
  static _instance: AdminServer
  config: typeof config
  mcServer: MCServer
  serviceName: string
  httpsServer: Server
  ROUTES: IRouteEntry[] = [
    {uri: '/admin/connections', method: 'GET', handler: this._getConnections}
  ]

  static getInstance(mcServer: MCServer): AdminServer {
    if (!AdminServer._instance) {
      AdminServer._instance = new AdminServer(mcServer)
    }
    return AdminServer._instance
  }

  private constructor(mcServer: MCServer) {
    this.config = config
    this.mcServer = mcServer
    this.serviceName = 'mcoserver:AdminServer;'

    try {
      const sslOptions = _sslOptions(config.certificate, this.serviceName)

      /** @type {import("https").Server} */
      this.httpsServer = createServer(
        sslOptions,
        (request: IncomingMessage, response: ServerResponse) => {
          this._httpsHandler(request, response)
        },
      )
    } catch (error) {
      throw new Error(`${error.message}, ${error.stack}`)
    }

    this.httpsServer.on('connection', this._socketEventHandler)
  }

  _fetchRouteHandler(request: IncomingMessage, response: ServerResponse) {
    const {url, method} = request
    const foundRoute = this.ROUTES.find((route: IRouteEntry) => {
      return route.uri === url && route.method === method
    })
    if (foundRoute) {
      return foundRoute.handler.call(this, request, response)
    }
    response.statusCode = 404
    return `404: Not found`
  }


  /**
   *
   * @return {string}
   */
  _getConnections(req: IncomingMessage, res: ServerResponse): string {
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
    res.setHeader('Content-Type', 'text/plain')
    return responseText
  }

  /**
   *
   * @return {string}
   */
  _handleResetAllQueueState(): string {
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

  _httpsHandler(request: IncomingMessage, response: ServerResponse): void {
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
        return response.end(this._fetchRouteHandler(request, response))
        // response.setHeader('Content-Type', 'text/plain')
        // return response.end(this._getConnections(request, response))

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
  _socketEventHandler(socket: Socket): void {
    socket.on('error', error => {
      throw new Error(`[AdminServer] SSL Socket Error: ${error.message}`)
    })
  }

  /**
   *
   * @param {module:config.config} config
   * @return {Promise<void>}
   */
  start(): Server {


    return this.httpsServer.listen({ port: 88, host: '0.0.0.0' }, () => {
      log('debug', 'port 88 listening', {
        service: 'mcoserver:AdminServer',
      })
    })
  }
}
