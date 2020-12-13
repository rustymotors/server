// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const {
  GenericReplyMsg
} = require('../../../src/services/MCServer/GenericReplyMsg')
const tap = require('tap')

const genericReplyMsg1 = new GenericReplyMsg()

tap.test('GenericReplyMsg', t => {
  const { msgNo, toFrom } = genericReplyMsg1
  t.equal(msgNo, 0)
  t.equal(toFrom, 0)
  t.deepEqual(genericReplyMsg1.serialize(), Buffer.alloc(16))
  t.done()
})
