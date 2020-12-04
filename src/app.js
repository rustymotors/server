// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { PatchServer } = require('./services/PatchAndShard/patchServer')
const { Server } = require('./server')

// MCOS Monolith
const server = new Server('./src/services/shared/config.json')
server.start()

// MCOS PatchAndShard
const patchAndShardServer = new PatchServer('./src/services/shared/config.json')
patchAndShardServer.start()
