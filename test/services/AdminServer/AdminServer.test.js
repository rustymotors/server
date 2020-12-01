// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
const { AdminServer } = require('../../../src/services/AdminServer/AdminServer')
const { MCServer } = require('../../../src/services/MCServer')
const tap = require('tap')

const adminServer = new AdminServer(new MCServer())

tap.test('AdminServer', (t) => {
  t.type(typeof adminServer.mcServer, 'MCServer')
  t.done()
})
