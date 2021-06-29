// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect } from 'chai'
import { LobbyInfoPacket } from '../src/services/MCServer/MCOTS/LobbyInfo.js'
import { LobbyMsg } from '../src/services/MCServer/MCOTS/LobbyMsg.js'

/* eslint-env mocha */

const lobbyInfo1 = new LobbyInfoPacket()
const lobbyMsg1 = new LobbyMsg()

it('LobbyInfo', () => {
  expect(lobbyInfo1.toPacket().length).equals(567)
})

it('LobbyMsg', () => {
  expect(lobbyMsg1.data.length).equals(572)
})
