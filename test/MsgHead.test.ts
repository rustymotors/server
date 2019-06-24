// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import MsgHead from "../services/shared/messageTypes/MsgHead";

const msgHead1 = new MsgHead(
  Buffer.concat([Buffer.from([0x14, 0x00]), Buffer.from("TOMC")])
);

describe("MsgHead", () => {
  test("length is correct", () => {
    expect(msgHead1.length).toBe(20);
  });
  test("mcosig is correct", () => {
    expect(msgHead1.mcosig).toBe("TOMC");
  });
});
