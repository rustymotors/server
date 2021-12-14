"use strict";
/*
 Mco-server is a game server, written from scratch, for an old game
 Copyright (C) <2017-2018>  <Joseph W Becher>
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
Object.defineProperty(exports, "__esModule", { value: true });
const mco_auth_1 = require("./services/@drazisil/mco-auth");
const mco_patch_1 = require("./services/@drazisil/mco-patch");
const mco_proxy_1 = require("./services/@drazisil/mco-proxy");
const mco_route_1 = require("./services/@drazisil/mco-route");
const mco_shard_1 = require("./services/@drazisil/mco-shard");
const AdminServer_1 = require("./services/AdminServer");
const MCServer_1 = require("./services/MCServer");
// What servers do we need?
// * Routing Server
mco_route_1.RoutingServer.getInstance().start();
// * Patch Server
mco_patch_1.PatchServer.getInstance().start();
// * AuthLogin
mco_auth_1.AuthLogin.getInstance().start();
// * Shard
mco_shard_1.ShardServer.getInstance().start();
// HTTPProxy
// Now that both patch and shard are up, we can proxy requests
mco_proxy_1.HTTPProxyServer.getInstance().start();
// * Persona
//   Persona needs connections to
//   *
// * Lobby Login
// * Lobby
// * MCOTS
// * Database manager
// const databaseManager = DatabaseManager.getInstance()
// * MCOS Monolith
const mcServer = MCServer_1.MCServer.getInstance();
mcServer.startServers();
// * Admin Server
//   Admin needs connections to
//   * MCOServer
AdminServer_1.AdminServer.getInstance(mcServer).start();
// Promise.all([server.start(), patchAndShardServer.start(), authLogin.start()])
//   .then(() => {
//     logger.log('All servers started successfully')
//   })
//   .catch(error => {
//     process.exitCode = -1
//     throw new Error(`There was an error starting the server: ${error}`)
//   })
//# sourceMappingURL=app.js.map