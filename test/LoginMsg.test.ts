// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect } from 'chai'
import { LoginMsg } from '../src/services/MCServer/MCOTS/LoginMsg'

/* eslint-env mocha */

const inboundBuffer = Buffer.alloc(42)
inboundBuffer.write('NotAPerson', 24)
inboundBuffer.write('0.0.0.0', 34)
const loginMsg1 = new LoginMsg(inboundBuffer)

it('LoginMsg', () => {
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
  expect(appId).equals(0)

  expect(toFrom).equals(0)

  expect(msgNo).equals(0)

  expect(customerId).equals(0)

  expect(personaId).equals(0)

  expect(lotOwnerId).equals(0)

  expect(brandedPartId).equals(0)

  expect(skinId).equals(0)

  expect(personaName).contains('NotAPerson')

  expect(version).contains('0.0.0.0')

  expect(data).equals(inboundBuffer)
})
