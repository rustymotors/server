import { Logger } from '@drazisil/mco-logger'
import { IncomingMessage, ServerResponse } from 'http'

const { log } = Logger.getInstance()

export class AdminServer {
  static _instance: AdminServer
  private _serviceName = 'mcoserver:AdminServer;'

  private constructor() {}

  static getInstance(): AdminServer {
    if (!AdminServer._instance) {
      AdminServer._instance = new AdminServer()
    }
    return AdminServer._instance
  }

  handleRequest(request: IncomingMessage, response: ServerResponse): ServerResponse {
      log('info', `Request for ${request.url} from ${request.socket.remoteAddress}`, { service: this._serviceName})
      response.write('Hello!')
      return response
  }
}
