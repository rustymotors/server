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
exports.MCServer = void 0;
const mco_logger_1 = require("@drazisil/mco-logger");
const index_1 = __importDefault(require("../../../config/index"));
const connection_mgr_1 = require("./connection-mgr");
const listener_thread_1 = require("./listener-thread");
const { log } = mco_logger_1.Logger.getInstance();
/**
 * This class starts all the servers
 * TODO: Better document this
 * @module MCServer
 */
/**
 * @class
 * @property {config.config} config
 * @property {ConnectionMgr} mgr
 */
class MCServer {
    static _instance;
    config;
    mgr;
    serviceName;
    static getInstance() {
        if (!MCServer._instance) {
            MCServer._instance = new MCServer();
        }
        return MCServer._instance;
    }
    constructor() {
        this.config = index_1.default;
        this.mgr = connection_mgr_1.ConnectionManager.getInstance();
        this.serviceName = 'mcoserver:MCServer';
    }
    /**
     * Start the HTTP, HTTPS and TCP connection listeners
     * @returns {Promise<void>}
     */
    async startServers() {
        const listenerThread = new listener_thread_1.ListenerThread();
        log('info', 'Starting the listening sockets...', {
            service: this.serviceName,
        });
        // TODO: Seperate the PersonaServer ports of 8226 and 8228
        const tcpPortList = [
            6660, 8228, 8226, 7003, 8227, 43_200, 43_300, 43_400, 53_303, 9000, 9001,
            9002, 9003, 9004, 9005, 9006, 9007, 9008, 9009, 9010, 9011, 9012, 9013,
            9014,
        ];
        for (const port of tcpPortList) {
            listenerThread.startTCPListener(port, this.mgr);
            log('debug', `port ${port} listening`, { service: this.serviceName });
        }
        log('info', 'Listening sockets create successfully.', {
            service: this.serviceName,
        });
    }
}
exports.MCServer = MCServer;
//# sourceMappingURL=index.js.map