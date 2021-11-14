/*
 mcos is a game server, written from scratch, for an old game
 Copyright (C) <2017-2021>  <Drazi Crendraven>
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

const { RoutingServer } = require("./packages/router/src/index.js");
const { PatchServer } = require("./packages/patch/src/index.js");
const { AuthLogin } = require("./packages/auth/src/index.js");
const { ShardServer } = require("./packages/shard/src/index.js");
const { HTTPProxyServer } = require("./packages/proxy/src/index.js");
const { MCServer } = require("./packages/core/src/index.js");
const { AdminServer } = require("./packages/admin/src/index.js");
const { DatabaseManager } = require("./packages/database/src/index.js");
const { LoginServer } = require("./packages/login/src/index.js");
const { ConnectionManager } = require("./packages/core/src/connection-mgr.js");
const { PersonaServer } = require("./packages/persona/src/index.js");
const { LobbyServer } = require("./packages/lobby/src/index.js");
const { MCOTServer } = require("./packages/transactions/src/index.js");

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

// * MCOS Monolith
MCServer.getInstance()
  .then(async (mcServer) => {
    await mcServer.startServers(
      ConnectionManager.getInstance(),
      LoginServer.getInstance(),
      PersonaServer.getInstance(),
      LobbyServer.getInstance(),
      MCOTServer.getInstance(),
      DatabaseManager.getInstance(),
    );

    // * Admin Server
    //   Admin needs connections to
    //   * MCServer
    AdminServer.getInstance().start(ConnectionManager.getInstance());

    // Promise.all([server.start(), patchAndShardServer.start(), authLogin.start()])
    //   .then(() => {
    //     logger.log('All servers started successfully')
    //   })
    //   .catch(error => {
    //     process.exitCode = -1
    //     throw new Error(`There was an error starting the server: ${error}`)
    //   })
  })
  .catch(() => {
    throw new Error("Help!");
  });
