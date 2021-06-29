/*
 mco-server is a game server, written from scratch, for an old game
 Copyright (C) <2017-2018>  <Joseph W Becher>
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import { log } from '@drazisil/mco-logger'
import { Server } from './src/server.js'
import { AuthLogin } from './src/services/AuthLogin/AuthLogin.js'
import { PatchServer } from './src/services/PatchAndShard/patchServer.js'
import { DatabaseManager } from './src/shared/DatabaseManager.js'

// Database manager
const databaseManager = new DatabaseManager()

// MCOS Monolith
const server = new Server(databaseManager)

// MCOS PatchAndShard
const patchAndShardServer = new PatchServer()

// MCOS AuthLogin and Shard
const authLogin = new AuthLogin()

Promise.all(
  [server.start(),
    patchAndShardServer.start(),
    authLogin.start()]
).then(
  () => {
    log('All servers started successfully')
  }
)
  .catch(
    (err) => {
      process.exitCode = -1
      throw new Error(`There was an error starting the server: ${err}`)
    }
  )
