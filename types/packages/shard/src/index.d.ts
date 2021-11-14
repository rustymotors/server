/**
 * Manages patch and update server connections
 * Also handles the shard list, and some utility endpoints
 * TODO: Document the endpoints
 */
export class ShardServer {
  /** @type {ShardServer} */
  static _instance: ShardServer;
  /**
   *
   * @returns {ShardServer}
   */
  static getInstance(): ShardServer;
  /** @type {import("../../config/src/index").AppConfiguration} */
  _config: import("../../config/src/index").AppConfiguration;
  /** @type {string[]} */
  _possibleShards: string[];
  /** @type {import("http").Server} */
  _server: import("http").Server;
  /**
   * Generate a shard list web document
   *
   * @return {string}
   */
  _generateShardList(): string;
  /**
   *
   * @return {string}
   */
  _handleGetCert(): string;
  /**
   *
   * @return {string}
   */
  _handleGetKey(): string;
  /**
   *
   * @return {string}
   */
  _handleGetRegistry(): string;
  /**
   * @param {import("http").IncomingMessage} request
   * @param {import("http").ServerResponse} response
   */
  _handleRequest(
    request: import("http").IncomingMessage,
    response: import("http").ServerResponse
  ): void;
  /**
   *
   * @returns {import("http").Server}
   */
  start(): import("http").Server;
}
