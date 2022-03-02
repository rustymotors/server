// @ts-check
// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// import config from "../config/appconfig";

// import { readFileSync } from "fs";
import { IncomingMessage, ServerResponse } from "http";
// import { createServer, Server } from "https";
import { Socket } from "net";
import { logger } from "../logger/index";
// import { EServerConnectionName, RoutingMesh } from "../router/index";
// import { SslOptions } from "../types/index";

const log = logger.child({ service: "MCOServer:Auth" });

/**
 * Handles web-based user logins
 */

export class AuthLogin {
  private static _instance: AuthLogin;

  // private _server: Server;

  static getInstance(): AuthLogin {
    if (!AuthLogin._instance) {
      AuthLogin._instance = new AuthLogin();
    }
    return AuthLogin._instance;
  }

  private constructor() {
    // this._server = createServer(this._sslOptions(), (request, response) => {
    //   this.handleRequest(request, response);
    // });
    // this._server.on("error", (error) => {
    //   process.exitCode = -1;
    //   log.error(`Server error: ${error.message}`);
    //   log.info(`Server shutdown: ${process.exitCode}`);
    //   process.exit();
    // });
    // this._server.on("tlsClientError", (error) => {
    //   log.warn(`[AuthLogin] SSL Socket Client Error: ${error.message}`);
    // });
  }

  /**
   *
   * @return {string}
   * @memberof! WebServer
   */
  _handleGetTicket(): string {
    return "Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e";
  }

  // File deepcode ignore NoRateLimitingForExpensiveWebOperation: Not using express, unsure how to handle rate limiting on raw http
  /**
   * @returns {ServerResponse}
   * @param {import("http").IncomingMessage} request
   * @param {import("http").ServerResponse} response
   */
  handleRequest(
    request: IncomingMessage,
    response: ServerResponse
  ): ServerResponse {
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
   * @returns {void}
   * @param {import("net").Socket} socket
   */
  _socketEventHandler(socket: Socket): void {
    socket.on("error", (error: Error) => {
      throw new Error(`[AuthLogin] SSL Socket Error: ${error.message}`);
    });
  }

  /**
   *
   * @returns {Promise<import("https").Server>}
   * @memberof! WebServer
   */
  // start(): void {
  //   if (!config.MCOS.SETTINGS.AUTH_LISTEN_HOST) {
  //     throw new Error("Please set MCOS__SETTINGS__AUTH_LISTEN_HOST");
  //   }
  //   const host = config.MCOS.SETTINGS.AUTH_LISTEN_HOST;
  //   const port = 443;
  //   log.debug(`Attempting to bind to port ${port}`);
  //   this._server.listen({ port, host }, () => {
  //     log.debug(`port ${port} listening`);
  //     log.info("Auth server listening");

  //     // // Register service with router
  //     // RoutingMesh.getInstance().registerServiceWithRouter(
  //     //   EServerConnectionName.AUTH,
  //     //   host,
  //     //   port
  //     // );
  //   });
  // }

  //   _sslOptions(): SslOptions {
  //     log.debug(`Reading ssl certificate...`);

  //     let cert;
  //     let key;

  //     try {
  //       if (!config.MCOS.CERTIFICATE.CERTIFICATE_FILE) {
  //         throw new Error("Please set MCOS__CERTIFICATE__CERTIFICATE_FILE");
  //       }
  //       cert = readFileSync(config.MCOS.CERTIFICATE.CERTIFICATE_FILE, {
  //         encoding: "utf-8",
  //       });
  //     } catch (error) {
  //       throw new Error(
  //         `Error loading ${config.MCOS.CERTIFICATE.CERTIFICATE_FILE}: (${error}), server must quit!`
  //       );
  //     }

  //     try {
  //       if (!config.MCOS.CERTIFICATE.PRIVATE_KEY_FILE) {
  //         throw new Error("Please set MCOS__CERTIFICATE__PRIVATE_KEY_FILE");
  //       }
  //       key = readFileSync(config.MCOS.CERTIFICATE.PRIVATE_KEY_FILE, {
  //         encoding: "utf-8",
  //       });
  //     } catch (error) {
  //       throw new Error(
  //         `Error loading ${config.MCOS.CERTIFICATE.PRIVATE_KEY_FILE}: (${error}), server must quit!`
  //       );
  //     }

  //     return {
  //       cert,
  //       honorCipherOrder: true,
  //       key,
  //       rejectUnauthorized: false,
  //     };
  //   }
}
