import http from 'http'
import { Logger } from '@drazisil/mco-logger'
import { EServerConnectionName } from 'types'
import { RoutingMesh } from 'router/client'
import { ShardServer } from 'shard'
import { PatchServer } from 'patch'
import process from 'process'

const { log } = Logger.getInstance()

export class HTTPProxyServer {
  /**
   * @type {HTTPProxyServer}
   */
  static _instance
  _server
  _serviceName = 'MCOServer:HTTPProxy'

  static getInstance() {
    if (!HTTPProxyServer._instance) {
      HTTPProxyServer._instance = new HTTPProxyServer(false)
    }
    return HTTPProxyServer._instance
  }

  constructor(isNew = true) {
    if (isNew) {
      throw new Error('Please use getInstance()')
    }
    this._server = http.createServer((request, response) => {
      this.handleRequest(request, response)
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
   * @param {http.IncomingMessage} request
   * @param {http.ServerResponse} response
   */
  handleRequest(request, response) {
    log(
      'debug',
      `Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`,
      { service: this._serviceName },
    )
    switch (request.url) {
      case '/games/EA_Seattle/MotorCity/UpdateInfo':
      case '/games/EA_Seattle/MotorCity/NPS':
      case '/games/EA_Seattle/MotorCity/MCO':
        return PatchServer.getInstance().handleRequest(request, response)

      default:
        return ShardServer.getInstance()._handleRequest(request, response)
    }
  }

  start() {
    const host = '0.0.0.0'
    const port = 80
    return this._server.listen({ port, host }, () => {
      log('debug', `port ${port} listening`, { service: this._serviceName })
      log('info', 'Proxy server is listening...', {
        service: this._serviceName,
      })

      // Register service with router
      RoutingMesh.getInstance().registerServiceWithRouter(
        EServerConnectionName.PROXY,
        host,
        port,
      )
    })
  }
}
