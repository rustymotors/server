// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const {
  MCOTServer
} = require('./MCOTServer')
const tap = require('tap')

const mcotServer = new MCOTServer()

tap.test('MCOTS Server', t => {
  tap.equal(mcotServer._MSG_STRING(438), 'MC_CLIENT_CONNECT_MSG')

  tap.equal(mcotServer._MSG_STRING(105), 'MC_LOGIN')

  tap.equal(mcotServer._MSG_STRING(106), 'MC_LOGOUT')

  tap.equal(mcotServer._MSG_STRING(109), 'MC_SET_OPTIONS')

  t.equal(mcotServer._MSG_STRING(141), 'MC_STOCK_CAR_INFO')
  t.done()
})
