// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { ClientConnectMsg } from "../services/shared/messageTypes/ClientConnectMsg";

const clientConnectMsg1 = new ClientConnectMsg(
  Buffer.concat([
    Buffer.from([0xb6, 0x01]),
    Buffer.from("TOMC"),
    Buffer.alloc(12),
  ])
);

describe("ClientConnectMsg", () => {
  test("msgNo is correct", () => {
    expect(clientConnectMsg1.msgNo).toBe(438);
  });
});
