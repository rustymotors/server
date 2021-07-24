import net from 'net'
import { EServerConnectionAction, IServerConnection } from '../mco-types'
import { Logger } from '@drazisil/mco-logger'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('./server.config.js')

const { log } = Logger.getInstance()

export class RoutingServer {
  static _instance: RoutingServer
  private _server: net.Server
  private _serverConnections: IServerConnection[] = []
  private _serviceName = 'MCOServer:Route'

  static getInstance(): RoutingServer {
    if (!RoutingServer._instance) {
      RoutingServer._instance = new RoutingServer()
    }
    return RoutingServer._instance
  }

  private constructor() {
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
  private _handleData(data: Buffer): void {
    const payload = data.toString()
    log('debug', `Payload: ${payload}`, {
      service: this._serviceName,
    })

    let payloadJSON: IServerConnection

    try {
      payloadJSON = JSON.parse(payload)
    } catch (error) {
      log('error', `Error pasing payload!: ${error}`, {
        service: this._serviceName,
      })
      return
    }

    const { action, service, host, port } = payloadJSON

    if (service && host && port) {
      const newService = {
        service,
        host,
        port,
      }
      this._serverConnections.push(newService)
      log('silly', JSON.stringify(newService), { service: this._serviceName })

      console.debug(this._serverConnections)

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

  async start(): Promise<net.Server> {
    const port = 4242
    this._server.listen(port, 'localhost', () => {
      log('info', `RoutingServer listening on port ${port}`, {
        service: this._serviceName,
      })
    })
    return this._server
  }
}
