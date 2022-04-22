// @ts-check
// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { logger } from "mcos-shared/logger";

const log = logger.child({ service: "MCOServer:Auth" });

/**
 * Handles web-based user logins
 */

export class AuthLogin {
  /**
   *
   *
   * @private
   * @static
   * @type {AuthLogin}
   * @memberof AuthLogin
   */
  static _instance;

  /**
   * Get the single instance of the class
   *
   * @static
   * @return {AuthLogin}
   * @memberof AuthLogin
   */
  static getInstance() {
    if (!AuthLogin._instance) {
      AuthLogin._instance = new AuthLogin();
    }
    return AuthLogin._instance;
  }

  /**
   * Creates an instance of AuthLogin.
   * 
   * Please use {@link AuthLogin.getInstance()} instead
   * @internal
   * @memberof AuthLogin
   */
  constructor() {
      // Intentionally empty
  }

  /**
   *
   * @private
   * @return {string}
   * @memberof! WebServer
   */
  _handleGetTicket() {
    return "Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e";
  }

  // File deepcode ignore NoRateLimitingForExpensiveWebOperation: Not using express, unsure how to handle rate limiting on raw http
  /**
   * Handle incoming http requests 
   * 
   * @returns {import("node:http").ServerResponse}
   * @param {import("node:http").IncomingMessage} request
   * @param {import("node:http").ServerResponse} response
   */
  handleRequest(
    request,
    response
  ) {
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
   * @returns {void}
   * @param {import("net").Socket} socket
   */
  _socketEventHandler(socket) {
    socket.on("error", (error) => {
      throw new Error(`[AuthLogin] SSL Socket Error: ${error.message}`);
    });
  }
}
