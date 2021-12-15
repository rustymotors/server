"use strict";
// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
exports.__esModule = true;
exports.AdminServer = void 0;
// import { createServer } from "https";
// import type { Server, Socket } from "net";
var index_1 = require("../logger/index");
var connection_mgr_1 = require("../core/connection-mgr");
// import config from "../config/appconfig";
// import { SslOptions } from "../types";
// import { readFileSync } from "fs";
var log = index_1.logger.child({ service: "mcoserver:AdminServer;" });
/**
 * SSL web server for managing the state of the system
 */
// function _sslOptions(): SslOptions {
//   log.debug(`Reading ssl certificate...`);
//   let cert;
//   let key;
//   try {
//     if (!config.MCOS.CERTIFICATE.CERTIFICATE_FILE) {
//       throw new Error("Please set MCOS__CERTIFICATE__CERTIFICATE_FILE");
//     }
//     cert = readFileSync(config.MCOS.CERTIFICATE.CERTIFICATE_FILE, {
//       encoding: "utf-8",
//     });
//   } catch (error) {
//     throw new Error(
//       `Error loading ${config.MCOS.CERTIFICATE.CERTIFICATE_FILE}: (${error}), server must quit!`
//     );
//   }
//   try {
//     if (!config.MCOS.CERTIFICATE.PRIVATE_KEY_FILE) {
//       throw new Error("Please set MCOS__CERTIFICATE__PRIVATE_KEY_FILE");
//     }
//     key = readFileSync(config.MCOS.CERTIFICATE.PRIVATE_KEY_FILE, {
//       encoding: "utf-8",
//     });
//   } catch (error) {
//     throw new Error(
//       `Error loading ${config.MCOS.CERTIFICATE.PRIVATE_KEY_FILE}: (${error}), server must quit!`
//     );
//   }
//   return {
//     cert,
//     honorCipherOrder: true,
//     key,
//     rejectUnauthorized: false,
//   };
// }
/**
 * @property {config} config
 * @property {IMCServer} mcServer
 * @property {Server} httpServer
 */
var AdminServer = /** @class */ (function () {
    function AdminServer() {
        // Intentionally empty
    }
    // httpsServer: Server | undefined;
    AdminServer.getInstance = function () {
        if (!AdminServer._instance) {
            AdminServer._instance = new AdminServer();
        }
        return AdminServer._instance;
    };
    /**
     * @return {string}
     */
    AdminServer.prototype._handleGetConnections = function () {
        var connections = connection_mgr_1.ConnectionManager.getInstance().dumpConnections();
        var responseText = "";
        for (var i = 0; i < connections.length; i++) {
            var connection = connections[i];
            if (typeof connection === "undefined") {
                return "No connections were found";
            }
            var displayConnection = "\n      index: ".concat(i, " - ").concat(connection.id, "\n          remoteAddress: ").concat(connection.remoteAddress, ":").concat(connection.localPort, "\n          Encryption ID: ").concat(connection.getEncryptionId(), "\n          inQueue:       ").concat(connection.inQueue, "\n      ");
            responseText += displayConnection;
        }
        return responseText;
    };
    /**
     * @return {string}
     */
    AdminServer.prototype._handleResetAllQueueState = function () {
        connection_mgr_1.ConnectionManager.getInstance().resetAllQueueState();
        var connections = connection_mgr_1.ConnectionManager.getInstance().dumpConnections();
        var responseText = "Queue state reset for all connections\n\n";
        for (var i = 0; i < connections.length; i++) {
            var connection = connections[i];
            if (typeof connection === "undefined") {
                return responseText.concat("No connections found");
            }
            var displayConnection = "\n      index: ".concat(i, " - ").concat(connection.id, "\n          remoteAddress: ").concat(connection.remoteAddress, ":").concat(connection.localPort, "\n          Encryption ID: ").concat(connection.getEncryptionId(), "\n          inQueue:       ").concat(connection.inQueue, "\n      ");
            responseText += displayConnection;
        }
        return responseText;
    };
    /**
     * @return {void}
     * @param {import("http").IncomingMessage} request
     * @param {import("http").ServerResponse} response
     */
    AdminServer.prototype.handleRequest = function (request, response) {
        log.info("[Admin] Request from ".concat(request.socket.remoteAddress, " for ").concat(request.method, " ").concat(request.url));
        log.info("Request received,\n      ".concat(JSON.stringify({
            url: request.url,
            remoteAddress: request.socket.remoteAddress
        })));
        switch (request.url) {
            case "/admin/connections":
                response.setHeader("Content-Type", "text/plain");
                return response.end(this._handleGetConnections());
            case "/admin/connections/resetAllQueueState":
                response.setHeader("Content-Type", "text/plain");
                return response.end(this._handleResetAllQueueState());
            default:
                if (request.url && request.url.startsWith("/admin")) {
                    return response.end("Jiggawatt!");
                }
        }
    };
    return AdminServer;
}());
exports.AdminServer = AdminServer;
