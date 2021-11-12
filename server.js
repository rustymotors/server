/*
 mcos is a game server, written from scratch, for an old game
 Copyright (C) <2017-2021>  <Drazi Crendraven>
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import { RoutingServer } from "./packages/router/src/index.js";
import { PatchServer } from "./packages/patch/src/index.js";
import { AuthLogin } from "./packages/auth/src/index.js";
import { ShardServer } from "./packages/shard/src/index.js";
import { HTTPProxyServer } from "./packages/proxy/src/index.js";
import { MCServer } from "./packages/core/src/index";
import { AdminServer } from "./packages/admin/src/index";

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
const mcServer = MCServer.getInstance();
mcServer.startServers();

// * Admin Server
//   Admin needs connections to
//   * MCOServer
AdminServer.getInstance(mcServer).start();

// Promise.all([server.start(), patchAndShardServer.start(), authLogin.start()])
//   .then(() => {
//     logger.log('All servers started successfully')
//   })
//   .catch(error => {
//     process.exitCode = -1
//     throw new Error(`There was an error starting the server: ${error}`)
//   })
