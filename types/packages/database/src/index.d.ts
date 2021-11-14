/// <reference types="node" />
/**
 * @exports
 * @typedef {Object} SessionRecord
 * @property {string} skey
 * @property {string} sessionkey
 */
export class DatabaseManager {
  /** @type {DatabaseManager} */
  static _instance: DatabaseManager;
  /** @return {DatabaseManager} */
  static getInstance(): DatabaseManager;
  /** @type {import("../../config/src/index").AppConfiguration} */
  _config: import("../../config/src/index").AppConfiguration;
  /** @type {Server} */
  _server: Server;
  changes: number;
  /** @type {import("sqlite").Database} */
  localDB: import("sqlite").Database;
  /**
   *
   * @param {IncomingMessage} request
   * @param {ServerResponse} response
   */
  handleRequest(request: IncomingMessage, response: ServerResponse): void;
  /**
   *
   * @param {number} customerId
   * @returns {Promise<SessionRecord>}
   */
  fetchSessionKeyByCustomerId(customerId: number): Promise<SessionRecord>;
  /**
   *
   * @param {string} connectionId
   * @returns {Promise<SessionRecord>}
   */
  fetchSessionKeyByConnectionId(connectionId: string): Promise<SessionRecord>;
  /**
   *
   * @param {number} customerId
   * @param {string} sessionkey
   * @param {string} contextId
   * @param {string} connectionId
   * @returns {Promise<number>}
   */
  _updateSessionKey(
    customerId: number,
    sessionkey: string,
    contextId: string,
    connectionId: string
  ): Promise<number>;
  /**
   *
   * @returns {Server}
   */
  start(): Server;
}
export type SessionRecord = {
  skey: string;
  sessionkey: string;
};
import { Server } from "http";
import { IncomingMessage } from "http";
import { ServerResponse } from "http";
