/*
 mcos is a game server, written from scratch, for an old game
 Copyright (C) <2017-2021>  <Drazi Crendraven>
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import * as dotenv from "dotenv-safe";
dotenv.config();
import { logger } from "../logger/index";
import { AdminServer } from "../admin/index";
import { AuthLogin } from "../auth/index";
import { ListenerThread } from "../core/listener-thread";
import { PatchServer } from "../patch/index";
import { HTTPProxyServer } from "../proxy/index";
import { RoutingServer } from "../router/index";
import { ShardServer } from "../shard/index";

const log = logger.child({ service: "mcos" });

// What servers do we need?
// * Routing Server
RoutingServer.getInstance().start();
// * Patch Server
PatchServer.getInstance().start();
// * AuthLogin
AuthLogin.getInstance().start();
// * Shard
ShardServer.getInstance().start();
// HTTPProxy
// Now that both patch and shard are up, we can proxy requests
HTTPProxyServer.getInstance().start();

// * Persona
//   Persona needs connections to
//   *
// * Lobby Login
// * Lobby
// * MCOTS

// * Database manager
// const databaseManager = DatabaseManager.getInstance()

// * MCOS Monolith
const listenerThread = ListenerThread.getInstance();
log.info({}, "Starting the listening sockets...");
// TODO: Seperate the PersonaServer ports of 8226 and 8228
const tcpPortList = [
  6660, 8228, 8226, 7003, 8227, 43_200, 43_300, 43_400, 53_303, 9000, 9001,
  9002, 9003, 9004, 9005, 9006, 9007, 9008, 9009, 9010, 9011, 9012, 9013, 9014,
];

for (const port of tcpPortList) {
  listenerThread.startTCPListener(port);
  log.info(`port ${port} listening`);
}

log.info("Listening sockets create successfully.");

// * Admin Server
//   Admin needs connections to
//   * MCOServer
AdminServer.getInstance().start();

// Promise.all([server.start(), patchAndShardServer.start(), authLogin.start()])
//   .then(() => {
//     logger.log('All servers started successfully')
//   })
//   .catch(error => {
//     process.exitCode = -1
//     throw new Error(`There was an error starting the server: ${error}`)
//   })
