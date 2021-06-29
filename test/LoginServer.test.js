// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect } from 'chai'
import { LoginServer } from '../src/services/MCServer/LoginServer/LoginServer.js'
import { fakeDatabaseManager } from './helpers.js'

/* eslint-env mocha */

const loginServer = new LoginServer(fakeDatabaseManager)

it('LoginServer', async () => {
  const { customerId, userId } = await loginServer._npsGetCustomerIdByContextId(
    'd316cd2dd6bf870893dfbaaf17f965884e'
  )
  expect(customerId).equals(5551212)
  expect(userId).equals(1)
})

it('LoginServer', async () => {
  const { customerId, userId } = await loginServer._npsGetCustomerIdByContextId(
    '5213dee3a6bcdb133373b2d4f3b9962758'
  )
  expect(customerId).equals(2885746688)
  expect(userId).equals(2)
})
