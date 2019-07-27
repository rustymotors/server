// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { MessageNode } from "./MessageNode";

const messageNode1 = new MessageNode("Recieved");
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

describe("MessageNode", () => {
  test("throws error when not passed long enough buffer", () => {
    expect(() => {
      new MessageNode("Recieved").deserialize(Buffer.from([0x00, 0x00]));
    }).toThrowError(
      "[MessageNode] Not long enough to deserialize, only 2 bytes long"
    );
  });

  test("packet is a MCOTS packet", () => {
    expect(messageNode1.isMCOTS()).toBe(true);
  });
});
