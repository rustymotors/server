"use strict";
/*
 mcos is a game server, written from scratch, for an old game
 Copyright (C) <2017-2021>  <Drazi Crendraven>
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
exports.__esModule = true;
var index_1 = require("../logger/index");
// import { AdminServer } from "../admin/index";
// import { AuthLogin } from "../auth/index";
var listener_thread_1 = require("../core/listener-thread");
var connectionEndpoints_1 = require("../server/connectionEndpoints");
var log = index_1.logger.child({ service: "mcos" });
Error.stackTraceLimit = 20;
(0, connectionEndpoints_1.startHTTPListener)();
(0, connectionEndpoints_1.startSSLListener)();
// AuthLogin.getInstance().start();
// HTTPProxyServer.getInstance().start();
var listenerThread = listener_thread_1.ListenerThread.getInstance();
log.info({}, "Starting the listening sockets...");
// TODO: Seperate the PersonaServer ports of 8226 and 8228
var tcpPortList = [
    6660, 8228, 8226, 7003, 8227, 43200, 43300, 43400, 53303, 9000, 9001,
    9002, 9003, 9004, 9005, 9006, 9007, 9008, 9009, 9010, 9011, 9012, 9013, 9014,
];
for (var _i = 0, tcpPortList_1 = tcpPortList; _i < tcpPortList_1.length; _i++) {
    var port = tcpPortList_1[_i];
    listenerThread.startTCPListener(port);
    log.info("port ".concat(port, " listening"));
}
log.info("Listening sockets create successfully.");
// AdminServer.getInstance().start();
