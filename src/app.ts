/*
 Mco-server is a game server, written from scratch, for an old game
 Copyright (C) <2017-2018>  <Joseph W Becher>
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import logger from '@drazisil/mco-logger'
import { Server } from './server'
import { AuthLogin } from './services/AuthLogin'
import { PatchServer } from './services/PatchAndShard/patch-server'
import { DatabaseManager } from './services/shared/database-manager'

// Database manager
const databaseManager = DatabaseManager.getInstance()

// MCOS Monolith
const server = new Server(databaseManager)

// MCOS PatchAndShard
const patchAndShardServer = new PatchServer()

// MCOS AuthLogin and Shard
const authLogin = new AuthLogin()

Promise.all([server.start(), patchAndShardServer.start(), authLogin.start()])
  .then(() => {
    logger.log('All servers started successfully')
  })
  .catch(error => {
    process.exitCode = -1
    throw new Error(`There was an error starting the server: ${error}`)
  })
