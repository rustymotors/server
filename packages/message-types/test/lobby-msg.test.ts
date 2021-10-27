// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect, it } from "@jest/globals";
import { LobbyInfoPacket } from "../src/index";
import { LobbyMessage } from "../src/index";

const lobbyInfo1 = new LobbyInfoPacket();
const lobbyMessage1 = new LobbyMessage();

it("LobbyInfo", () => {
  expect(lobbyInfo1.toPacket().length).toEqual(567);
});

it("LobbyMsg", () => {
  expect(lobbyMessage1.data.length).toEqual(572);
});
