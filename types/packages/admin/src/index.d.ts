/// <reference types="node" />
/**
 * SSL web server for managing the state of the system
 */
export class AdminServer {
  /** @type {AdminServer} */
  static _instance: AdminServer;
  /**
   *
   * @param {MCServer | undefined} mcServer
   * @returns {AdminServer}
   */
  static getInstance(mcServer: MCServer | undefined): AdminServer;
  /**
   * @private
   * @param {MCServer} mcServer
   */
  private constructor();
  /** @type {AppConfiguration} */
  config: AppConfiguration;
  /** @type {MCServer} */
  mcServer: MCServer;
  /** @type {Server | undefined} */
  httpsServer: Server | undefined;
  /**
   * @private
   * @return {string}
   */
  private _handleGetConnections;
  /**
   * @private
   * @return {string}
   */
  private _handleResetAllQueueState;
  /**
   * @private
   * @param {import("http").IncomingMessage} request
   * @param {import("http").ServerResponse} response
   */
  private _httpsHandler;
  /**
   * @param {import("net").Socket} socket
   */
  _socketEventHandler(socket: import("net").Socket): void;
  /**
   * @return {Server}
   */
  start(): Server;
}
import { AppConfiguration } from "../../config/src/index";
import { MCServer } from "../../core/src";
import { Server } from "https";
