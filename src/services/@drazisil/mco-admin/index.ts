import { Logger } from '@drazisil/mco-logger'
import { IncomingMessage, ServerResponse } from 'http'
import path from 'path'
import serveStatic from 'serve-static'

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

  handleRequest(request: IncomingMessage, response: ServerResponse): void {
      log('info', `Request for ${request.url} from ${request.socket.remoteAddress}`, { service: this._serviceName})
      serveStatic(path.join(__dirname, './site'))(request, response, () => {
          response.statusCode = 404
          response.end()
        })
  }
}
