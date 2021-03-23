// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { NPSUserStatus } from '../src/services/MCServer/LoginServer/npsUserStatus'
import { expect } from 'chai'

/* eslint-env mocha */

it('NPSUserStatus', () => {
  const testPacket = Buffer.from([0x7b, 0x00])
  const npsUserStatus = new NPSUserStatus(testPacket)
  expect(npsUserStatus.opCode).equals(123)
})
