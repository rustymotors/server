"use strict";
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const mco_logger_1 = __importDefault(require("@drazisil/mco-logger"));
const index_1 = __importDefault(require("../config/index"));
const index_2 = require("./services/AdminServer/index");
const index_3 = require("./services/MCServer/index");
/**
 * Main game server
 * @class
 * @property {config.config} config
 * @property {DatabaseManager} databaseManager
 * @property {MCServer} mcServer
 * @property {AdminServer} adminServer
 */
class Server {
    config;
    databaseManager;
    serviceName;
    mcServer;
    adminServer;
    /**
     * @param {DatabaseManager} databaseManager
     */
    constructor(databaseManager) {
        this.config = index_1.default;
        this.databaseManager = databaseManager;
        this.serviceName = 'mcoserver:Server';
    }
    /**
     * @return {Promise<void>}
     */
    async start() {
        mco_logger_1.default.log('Starting servers...', { service: 'mcoserver:Server' });
        // Start the MC Server
        this.mcServer = index_3.MCServer.getInstance();
        this.mcServer.startServers();
        // Start the Admin server
        this.adminServer = new index_2.AdminServer(this.mcServer);
        await this.adminServer.start(this.config);
        mco_logger_1.default.log('Web Server started', { service: 'mcoserver:Server' });
        mco_logger_1.default.log('Servers started, ready for connections.', {
            service: 'mcoserver:Server',
        });
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map