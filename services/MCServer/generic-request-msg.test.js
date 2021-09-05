// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect, it } from '@jest/globals'
import { GenericRequestMessage } from './generic-request-msg.js'
import { Buffer } from 'buffer'

const genericRequestMessage1 = new GenericRequestMessage()

it('GenericRequestMsg', () => {
  const { msgNo } = genericRequestMessage1
  expect(msgNo).toEqual(0)
  expect(genericRequestMessage1.serialize()).toStrictEqual(Buffer.alloc(16))
})
