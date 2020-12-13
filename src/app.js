// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const debug = require('debug')('mcoserver:app')
const appSettings = require('../config/app-settings')
const logger = require('./shared/logger')
const { WebServer } = require('./services/AuthLogin/AuthLogin')
const { PatchServer } = require('./services/PatchAndShard/patchServer')
const { Server } = require('./server')

// MCOS Monolith
const server = new Server('./src/services/shared/config.json')
server.start()

// MCOS PatchAndShard
const patchAndShardServer = new PatchServer(
  logger.child({ service: 'mcoserver:PatchServer' })
)
patchAndShardServer.start()

// MCOS AuthLogin and Shard
const AuthLogin = new WebServer(appSettings)
AuthLogin.start()