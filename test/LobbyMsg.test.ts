// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { LobbyInfo } from "../src/messageTypes/LobbyInfo";
import { LobbyMsg } from "../src/messageTypes/LobbyMsg";

const lobbyInfo1 = new LobbyInfo();
const lobbyMsg1 = new LobbyMsg();

describe("LobbyInfo", () => {
  test("packet is the correct length", () => {
    expect(lobbyInfo1.toPacket().length).toBe(567);
  });
});

describe("LobbyMsg", () => {
  test("packet is the correct length", () => {
    expect(lobbyMsg1.data.length).toBe(572);
  });
});
