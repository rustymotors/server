// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const {
  ClientConnectMsg
} = require('../../../src/services/MCServer/ClientConnectMsg')
const tap = require('tap')

tap.test('ClientConnectMsg', t => {
  const clientConnectMsg1 = new ClientConnectMsg(
    Buffer.concat([
      Buffer.from([0xb6, 0x01]),
      Buffer.from('TOMC'),
      Buffer.alloc(12)
    ])
  )

  t.equal(clientConnectMsg1.msgNo, 438)
  t.done()
})
