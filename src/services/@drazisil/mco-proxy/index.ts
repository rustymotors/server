import http from 'http'
import { Logger } from '@drazisil/mco-logger'
import { EServerConnectionName } from '../mco-types'
import { RoutingMesh } from '../mco-common'
import { ShardServer } from '../mco-shard'
import { PatchServer } from '../mco-patch'

const { log } = Logger.getInstance()

export class HTTPProxyServer {
  static _instance: HTTPProxyServer
  _server: http.Server
  _serviceName = 'MCOServer:HTTPProxy'

  static getInstance(): HTTPProxyServer {
    if (!HTTPProxyServer._instance) {
      HTTPProxyServer._instance = new HTTPProxyServer()
    }
    return HTTPProxyServer._instance
  }

  private constructor() {
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

  handleRequest(
    request: http.IncomingMessage,
    response: http.ServerResponse,
  ): void {
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

  start(): http.Server {
    const host = 'localhost'
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
