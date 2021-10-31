/*
 mcos is a game server, written from scratch, for an old game
 Copyright (C) <2017-2018>  <Joseph W Becher>
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import { AuthLogin } from "mcos-auth";
import { ShardServer } from "mcos-shard";
import { HTTPProxyServer } from "mcos-proxy";
import { MCServer } from "mcos-core";
import { AdminServer } from "mcos-admin";

// What servers do we need?
// * Routing Server
// RoutingServer.getInstance().start()
// * Patch Server
// PatchServer.getInstance().start()
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
