// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect, it } from '@jest/globals'
import { NPSPersonaMapsMsg } from '../src/services/PersonaServer/nps-persona-maps-msg.js'

it('NPSPersonaMapsMsg', () => {
  const npsPersonaMapsMessage = new NPSPersonaMapsMsg('RECEIVED')
  expect(npsPersonaMapsMessage.direction).toEqual('RECEIVED')
  expect(npsPersonaMapsMessage.msgNo).toEqual(0x6_07)
})
