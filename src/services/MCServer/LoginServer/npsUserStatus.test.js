// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const {
  NPSUserStatus
} = require('./npsUserStatus')
const tap = require('tap')

tap.test('NPSUserStatus', t => {
  const testPacket = Buffer.from([0x7b, 0x00])
  const npsUserStatus = new NPSUserStatus(testPacket)
  t.equal(npsUserStatus.opCode, 123)
  t.done()
})
