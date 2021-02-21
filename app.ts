/*
 mco-server is a game server, written from scratch, for an old game
 Copyright (C) <2017-2018>  <Joseph W Becher>
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import { appSettings } from './config/app-settings'
import { logger } from './src/shared/logger'
import { AuthLogin } from './src/services/AuthLogin/AuthLogin'
import { PatchServer } from './src/services/PatchAndShard/patchServer'
import { Server } from './src/server'
import { DatabaseManager, doMigrations } from './src/shared/DatabaseManager'

// Database manager
const dbLogger = logger.child({ service: 'mcoserver:DatabaseManager' })
const databaseManager = new DatabaseManager(dbLogger)
doMigrations(dbLogger)

// MCOS Monolith
const server = new Server(databaseManager)

// MCOS PatchAndShard
const patchAndShardServer = new PatchServer(
  logger.child({ service: 'mcoserver:PatchServer' })
)

// MCOS AuthLogin and Shard
const authLogin = new AuthLogin(appSettings)

Promise.all(
  [server.start(),
    patchAndShardServer.start(),
    authLogin.start()]
).then(
  () => {
    console.log('All servers started successfully')
  }
)
  .catch(
    (err) => {
      console.error(`There was an error starting the server: ${err}`)
      process.exit(-1)
    }
  )
