/// <reference types="node" />
import { IncomingMessage, Server, ServerResponse } from "http";
export declare class HTTPProxyServer {
  static _instance: HTTPProxyServer;
  _server: Server;
  static getInstance(): HTTPProxyServer;
  private constructor();
  handleRequest(request: IncomingMessage, response: ServerResponse): void;
  start(): void;
}
