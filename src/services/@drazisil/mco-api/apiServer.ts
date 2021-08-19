// @ts-check
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Logger } from '@drazisil/mco-logger'
import { IncomingMessage, ServerResponse } from 'http'
import { ConnectionManager } from '../mco-session/connection-mgr'

const { log } = Logger.getInstance()
/**
 * @module AdminServer
 */

export class APIServer {
  static _instance: APIServer
  private serviceName = 'mcoserver:APIServer;'

  static getInstance(): APIServer {
    if (!APIServer._instance) {
      APIServer._instance = new APIServer()
    }
    return APIServer._instance
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  _getConnections(): string {
    const connections = ConnectionManager.getInstance().dumpConnections()
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

  _handleResetAllQueueState(): string {
    ConnectionManager.getInstance().resetAllQueueState()
    const connections = ConnectionManager.getInstance().dumpConnections()
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

  _httpsHandler(
    request: IncomingMessage,
    response: ServerResponse,
  ): ServerResponse {
    log(
      'info',
      `Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`,
      { service: this.serviceName },
    )
    log(
      'info',
      `Requested recieved,
      ${JSON.stringify({
        url: request.url,
        remoteAddress: request.socket.remoteAddress,
      })}`,
      { service: this.serviceName },
    )
    switch (request.url) {
      case '/api/connections':
        response.setHeader('Content-Type', 'text/plain')
        response.write(this._getConnections())
        return response

      case '/api/connections/resetAllQueueState':
        response.setHeader('Content-Type', 'text/plain')
        response.write(this._handleResetAllQueueState())
        return response

      default:
        if (request.url && request.url.startsWith('/api')) {
          response.write('Jiggawatt!')
          return response
        }

        response.statusCode = 404
        response.write('Unknown request.')
        return response
    }
  }
}
