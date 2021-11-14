// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const t = require("tap");
const { LobbyServer } = require("../src/index.js");

t.test("LobbyServer", (t) => {
  const lobbyServer = LobbyServer.getInstance();
  t.equal(lobbyServer._generateSessionKeyBuffer("123").length, 64);

  t.equal(lobbyServer._npsHeartbeat().msgNo, 0x01_27);
  t.end();
});
