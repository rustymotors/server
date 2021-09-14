import { Logger } from '@drazisil/mco-logger'
import net from 'net'
import {
  EServerConnectionAction,
  EServerConnectionName,
  IServerConnection,
} from '@mco-server/types'

const { log } = Logger.getInstance()

export class RoutingMesh {
  static getInstance(): RoutingMesh {
    return new RoutingMesh()
  }

  private constructor() {
    // Inrnetionally empty
  }

  registerServiceWithRouter(
    service: EServerConnectionName,
    host: string,
    port: number,
  ): void {
    const payload: IServerConnection = {
      action: EServerConnectionAction.REGISTER_SERVICE,
      service,
      host,
      port,
    }
    const payloadBuffer = Buffer.from(JSON.stringify(payload))
    this._sendToRouter(service, payloadBuffer)
  }

  private _sendToRouter(
    service: EServerConnectionName,
    inputBuffer: Buffer,
  ): void {
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
