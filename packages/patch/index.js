import http from 'http'
import config from './server.config.js'
import { Logger } from '@drazisil/mco-logger'
import { EServerConnectionName } from 'types'
import { RoutingMesh } from 'router/client'
import { Buffer } from 'buffer'
import process from 'process'

const { log } = Logger.getInstance()
export const CastanetResponse = {
  body: Buffer.from('cafebeef00000000000003', 'hex'),
  header: {
    type: 'Content-Type',
    value: 'application/octet-stream',
  },
}

export class PatchServer {
  static _instance
  _config
  _server
  _serviceName = 'MCOServer:Patch'

  /**
   *
   * @returns {PatchServer}
   */
  static getInstance() {
    if (!PatchServer._instance) {
      PatchServer._instance = new PatchServer(false)
    }
    return PatchServer._instance
  }

  constructor(isNew = true) {
    if (isNew) {
      throw new Error('Please use getInstance()')
    }
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

  handleRequest(request, response) {
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

  start() {
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
