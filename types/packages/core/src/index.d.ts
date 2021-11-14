/**
 * This class starts all the servers
 */
export class MCServer {
  /** @type {MCServer} */
  static _instance: MCServer;
  /** @return {MCServer} */
  static getInstance(): MCServer;
  /** @type {AppConfiguration} */
  config: AppConfiguration;
  /**
   * @private
   * @type {ConnectionManager | undefined}
   */
  private mgr;
  clearConnectionQueue(): void;
  /** @returns {TCPConnection[]} */
  getConnections(): TCPConnection[];
  /**
   * Start the HTTP, HTTPS and TCP connection listeners
   * @returns {Promise<void>}
   */
  startServers(): Promise<void>;
}
import { AppConfiguration } from "../../config/src/index";
import { TCPConnection } from "./tcpConnection";
