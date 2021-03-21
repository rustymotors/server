// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect } from 'chai'
import { GenericReplyMsg } from '../src/services/MCServer/GenericReplyMsg'

/* eslint-env mocha */

const genericReplyMsg1 = new GenericReplyMsg()

it('GenericReplyMsg', function () {
  const { msgNo, toFrom } = genericReplyMsg1
  expect(msgNo).equals(0)
  expect(toFrom).equals(0)
  expect(genericReplyMsg1.serialize()).to.deep.equal(Buffer.alloc(16))
})
