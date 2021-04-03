// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { expect } = require('chai')
const { MCOTServer } = require('../src/services/MCServer/MCOTS/MCOTServer')
const { fakeLogger } = require('./helpers')

/* eslint-env mocha */

const mcotServer = new MCOTServer(fakeLogger)

it('MCOTS Server', () => {
  expect(mcotServer._MSG_STRING(438)).equals('MC_CLIENT_CONNECT_MSG')

  expect(mcotServer._MSG_STRING(105)).equals('MC_LOGIN')

  expect(mcotServer._MSG_STRING(106)).equals('MC_LOGOUT')

  expect(mcotServer._MSG_STRING(109)).equals('MC_SET_OPTIONS')

  expect(mcotServer._MSG_STRING(141),).equals('MC_STOCK_CAR_INFO')
})
