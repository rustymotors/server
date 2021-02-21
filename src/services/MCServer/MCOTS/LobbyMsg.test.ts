// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { LobbyInfoPacket } from './LobbyInfo'
import { LobbyMsg } from './LobbyMsg'
import tap from 'tap'

const lobbyInfo1 = new LobbyInfoPacket()
const lobbyMsg1 = new LobbyMsg()

tap.test('LobbyInfo', t => {
  t.equal(lobbyInfo1.toPacket().length, 567)
  t.done()
})

tap.test('LobbyMsg', t => {
  t.equal(lobbyMsg1.data.length, 572)
  t.done()
})
