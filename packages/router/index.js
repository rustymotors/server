/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-check
import net from 'net'
import { Logger } from '@drazisil/mco-logger'
import { EServerConnectionAction } from 'types'

/**
 * @module router
 */

const { log } = Logger.getInstance()

/**
 * @property {RoutingServer} _instance
 * @property {IServerConnection[]} _serverConnections
 */
export class RoutingServer {
  /**
   * @type {RoutingServer}
   */
  static _instance
  _server
  _serverConnections = []
  _serviceName = 'MCOServer:Route'

  /**
   *
   * @returns {RoutingServer}
   */
  static getInstance() {
    if (!RoutingServer._instance) {
      RoutingServer._instance = new RoutingServer(false)
    }
    return RoutingServer._instance
  }

  constructor(isNew = true) {
    if (isNew) {
      throw new Error('Please use getInstance()')
    }
    this._server = net.createServer(socket => {
      socket.on('end', () => {
        const { localPort, remoteAddress, remotePort } = socket

        log(
          'debug',
          `Service ${remoteAddress}:${remotePort} disconnected from port ${localPort}`,
          {
            service: this._serviceName,
          },
        )
      })
      socket.on('data', data => {
        this._handleData(data)
      })
      socket.on('error', error => {
        if (!error.message.includes('ECONNRESET')) {
          throw new Error(`Socket error: ${error}`)
        }
      })
    })
  }
  /**
   * @param {Buffer} data
   */
  _handleData(data) {
    const payload = data.toString()
    log('debug', `Payload: ${JSON.stringify(payload)}`, {
      service: this._serviceName,
    })

    /** @type {import('types').IServerConnection} */
    let payloadJSON

    try {
      payloadJSON = JSON.parse(payload)
    } catch (error) {
      log('error', `Error pasing payload!: ${error}`, {
        service: this._serviceName,
      })
      return
    }

    const { action } = payloadJSON

    if (action === EServerConnectionAction.REGISTER_SERVICE) {
      return this._registerNewService(payloadJSON)
    } else {
      throw new Error('Method not implemented.')
    }
  }

  /**
   * @param {import('types').IServerConnection} payloadJSON
   */
  _registerNewService(payloadJSON) {
    const { service, host, port } = payloadJSON

    if (service && host && port) {
      const newService = {
        service,
        host,
        port,
      }
      this._serverConnections.push(newService)
      log('debug', `Registered new service: ${JSON.stringify(newService)}`, {
        service: this._serviceName,
      })

      return
    }
    log(
      'error',
      `There was an error adding server connection: ${payloadJSON}`,
      {
        service: this._serviceName,
      },
    )
  }

  /**
   *
   * @returns {Promise<import('net').Server>}
   */
  async start() {
    const port = 4242
    this._server.listen(port, '0.0.0.0', () => {
      log('info', `RoutingServer listening on port ${port}`, {
        service: this._serviceName,
      })
    })
    return this._server
  }
}
