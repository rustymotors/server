// @ts-check
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger } from '@drazisil/mco-logger'
import net from 'net'
import { EServerConnectionAction } from 'types'
import { Buffer } from 'buffer'

const { log } = Logger.getInstance()

export class RoutingMesh {
  static _instance
  /**
   *
   * @returns {RoutingMesh}
   */
  static getInstance() {
    if (!RoutingMesh._instance) {
      RoutingMesh._instance = new RoutingMesh(false)
    }
    return RoutingMesh._instance
  }

  constructor(isNew = true) {
    if (isNew) throw new Error('Please use getInstance()')
  }

  /**
   *
   * @param {import('types').EServerConnectionName} service
   * @param {string} host
   * @param {number} port
   * @external types
   */
  registerServiceWithRouter(service, host, port) {
    /** @type {import('types').IServerConnection} */
    const payload = {
      action: EServerConnectionAction.REGISTER_SERVICE,
      service,
      host,
      port,
    }
    const payloadBuffer = Buffer.from(JSON.stringify(payload))
    this._sendToRouter(service, payloadBuffer)
  }

  /**
   *
   * @param {import('types').EServerConnectionName} service
   * @param {Buffer} inputBuffer
   * @returns {void}
   */
  _sendToRouter(service, inputBuffer) {
    const client = net.createConnection({ port: 4242 }, () => {
      // 'connect' listener.
      log('debug', 'Connected to RoutingServer', {
        service,
      })
      client.end(inputBuffer)
    })
    client.on('data', data => {
      console.log(data.toString())
      client.end()
    })
    client.on('end', () => {
      log('info', 'disconnected from RoutingServer', {
        service,
      })
    })
  }
}
