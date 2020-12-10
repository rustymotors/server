// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { NPSPersonaMapsMsg } = require('../../../../src/services/MCServer/PersonaServer/NPSPersonaMapsMsg')
const tap = require('tap')

tap.test('NPSPersonaMapsMsg', (t) => {
  const npsPersonaMapsMsg = new NPSPersonaMapsMsg('Recieved')
  t.equal(npsPersonaMapsMsg.direction, 'Recieved')
  t.equal(npsPersonaMapsMsg.msgNo, 0x607)
  t.done()
})
