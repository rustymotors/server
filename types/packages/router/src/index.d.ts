export type EServerConnectionName = string;
export namespace EServerConnectionName {
  const ADMIN: string;
  const AUTH: string;
  const MCSERVER: string;
  const PATCH: string;
  const PROXY: string;
  const SHARD: string;
  const DATABASE: string;
}
export type EServerConnectionAction = string;
export namespace EServerConnectionAction {
  const REGISTER_SERVICE: string;
}
export type EServiceQuery = string;
export namespace EServiceQuery {
  const GET_CONNECTIONS: string;
}
/**
 * @export
 * @typedef {Object} ServerConnectionRecord
 * @property {typeof EServerConnectionAction} [action]
 * @property {typeof EServerConnectionName} name
 * @property {string} host
 * @property {number} port
 */
export class RoutingServer {
  /** @type {RoutingServer} */
  static _instance: RoutingServer;
  /**
   *
   * @returns {RoutingServer}
   */
  static getInstance(): RoutingServer;
  /**
   * @private
   * @type {ServerConnectionRecord[]}
   */
  private _serverConnections;
  /**
   *
   * @param {ServerConnectionRecord} payloadJSON
   * @returns {void}
   */
  registerNewService(payloadJSON: ServerConnectionRecord): void;
  /**
   *
   * @param {Buffer} data
   * @returns {void}
   */
  handleData(data: Buffer): void;
  start(): void;
}
export { RoutingMesh };
export type ServerConnectionRecord = {
  action?: typeof EServerConnectionAction;
  name: typeof EServerConnectionName;
  host: string;
  port: number;
};
import { RoutingMesh } from "./client";
