// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect } from 'chai'
import { LobbyServer } from '../src/services/MCServer/LobbyServer/LobbyServer.js'

/* eslint-env mocha */

it('LobbyServer', () => {
  const lobbyServer = new LobbyServer()
  expect(lobbyServer._generateSessionKeyBuffer('123').length).equals(64)

  expect(lobbyServer._npsHeartbeat().msgNo).equals(0x0127)
})
