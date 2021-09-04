// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect, it } from '@jest/globals'
import { NPSUserInfo } from '../services/LobbyServer/nps-user-info'
import { EMessageDirection } from '../services/MCOTS/message-node'

it('NPSUserInfo', () => {
  const testPacket = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x84, 0x5f, 0xed]),
    Buffer.alloc(98),
  ])
  const npsUserInfo = new NPSUserInfo(EMessageDirection.RECEIVED)
  npsUserInfo.deserialize(testPacket)
  expect(npsUserInfo.userId).toEqual(8_675_309)
})
