// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import test from "ava";
import { LobbyInfoPacket, LobbyMessage } from "./index";

const lobbyInfo1 = new LobbyInfoPacket();
const lobbyMessage1 = new LobbyMessage();

test("LobbyInfo", (t) => {
  t.is(lobbyInfo1.toPacket().length, 567);
  
});

test("LobbyMsg", (t) => {
  t.is(lobbyMessage1.data.length, 572);
  
});
