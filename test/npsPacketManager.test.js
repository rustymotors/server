// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { NPSPacketManager } = require('../src/services/MCServer/npsPacketManager')
const { fakeDatabaseManager, fakeLogger } = require('./helpers')
const { expect } = require('chai')

/* eslint-env mocha */

describe('NPSPacketManager', () => {
  it('NPSPacketManger', async () => {
    const npsPacketManager = new NPSPacketManager(fakeDatabaseManager, fakeLogger)
    expect(npsPacketManager.msgCodetoName(0x229)).to.equal('NPS_MINI_USER_LIST')
  })
})
