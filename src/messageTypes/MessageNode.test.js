// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { MessageNode } = require("./MessageNode");

const messageNode1 = new MessageNode();
messageNode1.deserialize(
  Buffer.from([
    0x00,
    0x00,
    0x54,
    0x4f,
    0x4d,
    0x43,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
  ])
);

test("packet is a MCOTS packet", () => {
  expect(messageNode1.isMCOTS()).toBe(true);
});
