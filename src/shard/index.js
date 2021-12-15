"use strict";
// @ts-check
// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
exports.__esModule = true;
exports.ShardServer = void 0;
var appconfig_1 = require("../config/appconfig");
var index_1 = require("../logger/index");
var fs_1 = require("fs");
// import { EServerConnectionName, RoutingMesh } from "../router";
var shard_entry_1 = require("./shard-entry");
var https_1 = require("https");
// This section of the server can not be encrypted. This is an intentional choice for compatibility
// deepcode ignore HttpToHttps: This is intentional. See above note.
var log = index_1.logger.child({ service: "MCOServer:Shard" });
/**
 * Manages patch and update server connections
 * Also handles the shard list, and some utility endpoints
 * TODO: Document the endpoints
 */
/**
 * @class
 * @property {config.config} config
 * @property {string[]} banList
 * @property {string[]} possibleShards
 * @property {Server} serverPatch
 */
var ShardServer = /** @class */ (function () {
    function ShardServer() {
        var _this = this;
        this._possibleShards = [];
        this._server = (0, https_1.createServer)(function (request, response) {
            _this._handleRequest(request, response);
        });
        this._server.on("error", function (error) {
            process.exitCode = -1;
            log.error("Server error: ".concat(error.message));
            log.info("Server shutdown: ".concat(process.exitCode));
            process.exit();
        });
    }
    ShardServer.getInstance = function () {
        if (!ShardServer._instance) {
            ShardServer._instance = new ShardServer();
        }
        return ShardServer._instance;
    };
    /**
     * Generate a shard list web document
     *
     * @return {string}
     * @memberof! PatchServer
     */
    ShardServer.prototype._generateShardList = function () {
        if (!appconfig_1["default"].MCOS.SETTINGS.SHARD_EXTERNAL_HOST) {
            throw new Error("Please set MCOS__SETTINGS__SHARD_EXTERNAL_HOST");
        }
        var shardHost = appconfig_1["default"].MCOS.SETTINGS.SHARD_EXTERNAL_HOST;
        var shardClockTower = new shard_entry_1.ShardEntry("The Clocktower", "The Clocktower", 44, shardHost, 8226, shardHost, 7003, shardHost, 0, "", "Group-1", 88, 2, shardHost, 80);
        this._possibleShards.push(shardClockTower.formatForShardList());
        var shardTwinPinesMall = new shard_entry_1.ShardEntry("Twin Pines Mall", "Twin Pines Mall", 88, shardHost, 8226, shardHost, 7003, shardHost, 0, "", "Group-1", 88, 2, shardHost, 80);
        this._possibleShards.push(shardTwinPinesMall.formatForShardList());
        /** @type {string[]} */
        var activeShardList = [];
        activeShardList.push(shardClockTower.formatForShardList());
        return activeShardList.join("\n");
    };
    /**
     *
     * @return {string}
     * @memberof! WebServer
     */
    ShardServer.prototype._handleGetCert = function () {
        if (!appconfig_1["default"].MCOS.CERTIFICATE.CERTIFICATE_FILE) {
            throw new Error("Pleas set MCOS__CERTIFICATE__CERTIFICATE_FILE");
        }
        return (0, fs_1.readFileSync)(appconfig_1["default"].MCOS.CERTIFICATE.CERTIFICATE_FILE).toString();
    };
    /**
     *
     * @return {string}
     * @memberof! WebServer
     */
    ShardServer.prototype._handleGetKey = function () {
        if (!appconfig_1["default"].MCOS.CERTIFICATE.PUBLIC_KEY_FILE) {
            throw new Error("Please set MCOS__CERTIFICATE__PUBLIC_KEY_FILE");
        }
        return (0, fs_1.readFileSync)(appconfig_1["default"].MCOS.CERTIFICATE.PUBLIC_KEY_FILE).toString();
    };
    /**
     *
     * @return {string}
     * @memberof! WebServer
     */
    ShardServer.prototype._handleGetRegistry = function () {
        if (!appconfig_1["default"].MCOS.SETTINGS.AUTH_EXTERNAL_HOST) {
            throw new Error("Please set MCOS__SETTINGS__AUTH_EXTERNAL_HOST");
        }
        if (!appconfig_1["default"].MCOS.SETTINGS.SHARD_EXTERNAL_HOST) {
            throw new Error("Please set MCOS__SETTINGS__SHARD_EXTERNAL_HOST");
        }
        if (!appconfig_1["default"].MCOS.SETTINGS.PATCH_EXTERNAL_HOST) {
            throw new Error("Please set MCOS__SETTINGS__PATCH_EXTERNAL_HOST");
        }
        var patchHost = appconfig_1["default"].MCOS.SETTINGS.PATCH_EXTERNAL_HOST;
        var authHost = appconfig_1["default"].MCOS.SETTINGS.AUTH_EXTERNAL_HOST;
        var shardHost = appconfig_1["default"].MCOS.SETTINGS.SHARD_EXTERNAL_HOST;
        return "Windows Registry Editor Version 5.00\n\n[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\EACom\\AuthAuth]\n\"AuthLoginBaseService\"=\"AuthLogin\"\n\"AuthLoginServer\"=\"".concat(authHost, "\"\n\n[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Electronic Arts\\Motor City]\n\"GamePatch\"=\"games/EA_Seattle/MotorCity/MCO\"\n\"UpdateInfoPatch\"=\"games/EA_Seattle/MotorCity/UpdateInfo\"\n\"NPSPatch\"=\"games/EA_Seattle/MotorCity/NPS\"\n\"PatchServerIP\"=\"").concat(patchHost, "\"\n\"PatchServerPort\"=\"80\"\n\"CreateAccount\"=\"").concat(authHost, "/SubscribeEntry.jsp?prodID=REG-MCO\"\n\"Language\"=\"English\"\n\n[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Electronic Arts\\Motor City\\1.0]\n\"ShardUrl\"=\"http://").concat(shardHost, "/ShardList/\"\n\"ShardUrlDev\"=\"http://").concat(shardHost, "/ShardList/\"\n\n[HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Electronic Arts\\Motor City\\AuthAuth]\n\"AuthLoginBaseService\"=\"AuthLogin\"\n\"AuthLoginServer\"=\"").concat(authHost, "\"\n\n[HKEY_LOCAL_MACHINE\\Software\\WOW6432Node\\Electronic Arts\\Network Play System]\n\"Log\"=\"1\"\n\n");
    };
    /**
     * @return {void}
     * @memberof ! PatchServer
     * @param {import("http").IncomingMessage} request
     * @param {import("http").ServerResponse} response
     */
    ShardServer.prototype._handleRequest = function (request, response) {
        if (request.url === "/cert") {
            response.setHeader("Content-disposition", "attachment; filename=cert.pem");
            return response.end(this._handleGetCert());
        }
        if (request.url === "/key") {
            response.setHeader("Content-disposition", "attachment; filename=pub.key");
            return response.end(this._handleGetKey());
        }
        if (request.url === "/registry") {
            response.setHeader("Content-disposition", "attachment; filename=mco.reg");
            return response.end(this._handleGetRegistry());
        }
        if (request.url === "/") {
            response.statusCode = 404;
            return response.end("Hello, world!");
        }
        if (request.url === "/ShardList/") {
            log.debug("Request from ".concat(request.socket.remoteAddress, " for ").concat(request.method, " ").concat(request.url, "."));
            response.setHeader("Content-Type", "text/plain");
            return response.end(this._generateShardList());
        }
        // Is this a hacker?
        response.statusCode = 404;
        response.end("");
        // Unknown request, log it
        log.info("Unknown Request from ".concat(request.socket.remoteAddress, " for ").concat(request.method, " ").concat(request.url));
    };
    ShardServer.prototype.start = function () {
        if (!appconfig_1["default"].MCOS.SETTINGS.SHARD_LISTEN_HOST) {
            throw new Error("Please set MCOS__SETTINGS__SHARD_LISTEN_HOST");
        }
        var host = appconfig_1["default"].MCOS.SETTINGS.SHARD_LISTEN_HOST;
        var port = 80;
        log.debug("Attempting to bind to port ".concat(port));
        return this._server.listen({ port: port, host: host }, function () {
            log.debug("port ".concat(port, " listening"));
            log.info("Shard server is listening...");
            // // Register service with router
            // RoutingMesh.getInstance().registerServiceWithRouter(
            //   EServerConnectionName.SHARD,
            //   host,
            //   port
            // );
        });
    };
    return ShardServer;
}());
exports.ShardServer = ShardServer;
