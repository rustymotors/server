// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { GenericRequestMsg } = require('../../../src/services/MCServer/GenericRequestMsg')
const tap = require('tap')

const genericRequestMsg1 = new GenericRequestMsg()

tap.test('GenericRequestMsg', (t) => {
  const { msgNo } = genericRequestMsg1
  t.equal(msgNo, 0)
  t.deepEqual(genericRequestMsg1.serialize(), Buffer.alloc(16))
  t.done()
})
