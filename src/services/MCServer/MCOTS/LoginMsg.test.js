// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const {
  LoginMsg
} = require('./LoginMsg.js')
const tap = require('tap')

const inboundBuffer = Buffer.alloc(42)
inboundBuffer.write('NotAPerson', 24)
inboundBuffer.write('0.0.0.0', 34)
const loginMsg1 = new LoginMsg(inboundBuffer)

tap.test('LoginMsg', t => {
  const {
    appId,
    toFrom,
    msgNo,
    customerId,
    personaId,
    lotOwnerId,
    brandedPartId,
    skinId,
    personaName,
    version,
    data
  } = loginMsg1
  t.equal(appId, 0)

  t.equal(toFrom, 0)

  t.equal(msgNo, 0)

  t.equal(customerId, 0)

  t.equal(personaId, 0)

  t.equal(lotOwnerId, 0)

  t.equal(brandedPartId, 0)

  t.equal(skinId, 0)

  t.contains(personaName, 'NotAPerson')

  t.contains(version, '0.0.0.0')

  t.equal(data, inboundBuffer)
  t.done()
})
