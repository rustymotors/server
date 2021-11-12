// @ts-check
// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import P from "pino";
import { IncomingMessage, ServerResponse } from "http";
import { Socket } from "net";
import { readFileSync } from "fs";
import { EServerConnectionName, RoutingMesh } from "../../router/src/index";
import { createServer, Server } from "https";
import { AppConfiguration, ConfigurationManager } from "../../config/src/index";

const log = P().child({ service: "MCOServer:Auth" });
log.level = process.env["LOG_LEVEL"] || "info";

/**
 * @typedef {Object} SSLOptions
 * @property {string} cert
 * @property {boolean} honorCipherOrder
 * @property {string} key
 * @property {boolean} rejectUnauthorized
 */


/**
 * @exports
 * Handles web-based user logins
 */

export class AuthLogin {
  /** @type {AuthLogin} */
  static _instance;
  /** @type {AppConfiguration} */
  config;

  /** @type {Server} */
  _server;

  /**
   * 
   * @returns {AuthLogin}
   */
  static getInstance() {
    if (!AuthLogin._instance) {
      AuthLogin._instance = new AuthLogin();
    }
    return AuthLogin._instance;
  }

  /** @private */
  constructor() {
    this.config = ConfigurationManager.getInstance().getConfig();

    this._server = createServer(this._sslOptions(), (request, response) => {
      this.handleRequest(request, response);
    });

    this._server.on("error", (error) => {
      process.exitCode = -1;
      log.error(`Server error: ${error.message}`);
      log.info(`Server shutdown: ${process.exitCode}`);
      process.exit();
    });
    this._server.on("tlsClientError", (error) => {
      log.warn(`[AuthLogin] SSL Socket Client Error: ${error.message}`);
    });
  }

  /**
   *
   * @return {string}
   */
  _handleGetTicket() {
    return "Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e";
  }

  /**
   * 
   * @param {IncomingMessage} request 
   * @param {ServerResponse} response 
   */
  handleRequest(request, response) {
    log.info(
      `[Web] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}`
    );
    if (request.url && request.url.startsWith("/AuthLogin")) {
      response.setHeader("Content-Type", "text/plain");
      return response.end(this._handleGetTicket());
    }

    return response.end("Unknown request.");
  }

  /**
   * @private
   * @param {Socket} socket 
   */
  _socketEventHandler(socket) {
    socket.on("error", (error) => {
      throw new Error(`[AuthLogin] SSL Socket Error: ${error.message}`);
    });
  }

  start() {
    const host = this.config.serverSettings.ipServer || "localhost";
    const port = 443;
    log.debug(`Attempting to bind to port ${port}`);
    this._server.listen({ port, host }, () => {
      log.debug(`port ${port} listening`);
      log.info("Auth server listening");

      // Register service with router
      RoutingMesh.getInstance().registerServiceWithRouter(
        EServerConnectionName.AUTH,
        host,
        port
      );
    });
  }

  /** 
   * @private
   * @returns {SSLOptions}
   */
  _sslOptions() {
    log.debug(`Reading ${this.config.certificate.certFilename}`);

    let cert;
    let key;

    try {
      cert = readFileSync(this.config.certificate.certFilename, {
        encoding: "utf-8",
      });
    } catch (error) {
      throw new Error(
        `Error loading ${this.config.certificate.certFilename}: (${error}), server must quit!`
      );
    }

    try {
      key = readFileSync(this.config.certificate.privateKeyFilename, {
        encoding: "utf-8",
      });
    } catch (error) {
      throw new Error(
        `Error loading ${this.config.certificate.privateKeyFilename}: (${error}), server must quit!`
      );
    }

    return {
      cert,
      honorCipherOrder: true,
      key,
      rejectUnauthorized: false,
    };
  }
}
