import http from 'http'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('./server.config.js')
import { Logger } from '@drazisil/mco-logger'
import { EServerConnectionName } from '../mco-types'
import { RoutingMesh } from '../mco-common'

const { log } = Logger.getInstance()
export const CastanetResponse = {
  body: Buffer.from('cafebeef00000000000003', 'hex'),
  header: {
    type: 'Content-Type',
    value: 'application/octet-stream',
  },
}

export class PatchServer {
  static _instance: PatchServer
  _config: typeof config
  _server: http.Server
  _serviceName = 'MCOServer:Patch'

  static getInstance(): PatchServer {
    if (!PatchServer._instance) {
      PatchServer._instance = new PatchServer()
    }
    return PatchServer._instance
  }

  private constructor() {
    this._config = config

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
    const responseData = CastanetResponse

    switch (request.url) {
      case '/games/EA_Seattle/MotorCity/UpdateInfo':
      case '/games/EA_Seattle/MotorCity/NPS':
      case '/games/EA_Seattle/MotorCity/MCO':
        log(
          'debug',
          `[PATCH] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`,
          { service: this._serviceName },
        )

        response.setHeader(responseData.header.type, responseData.header.value)
        response.end(responseData.body)
        break

      default:
        response.statusCode = 404
        response.end('')
        break
    }
  }

  start(): http.Server {
    const host = config.serverSettings.host || 'localhost'
    const port = 81
    return this._server.listen({ port, host }, () => {
      log('debug', `port ${port} listening`, { service: this._serviceName })
      log('info', 'Patch server is listening...', {
        service: this._serviceName,
      })

      // Register service with router
      RoutingMesh.getInstance().registerServiceWithRouter(
        EServerConnectionName.PATCH,
        host,
        port,
      )
    })
  }
}
