// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { NPSPersonaMapsMsg } from "./NPSPersonaMapsMsg";
import { MSG_DIRECTION } from "../MCOTS/NPSMsg";

describe("NPSPersonaMapsMsg", () => {
  const npsPersonaMapsMsg = new NPSPersonaMapsMsg(MSG_DIRECTION.RECIEVED);
  test("direction is set correctly", () => {
    expect(npsPersonaMapsMsg.direction).toEqual(MSG_DIRECTION.RECIEVED);
    expect(npsPersonaMapsMsg.msgNo).toEqual(0x607);
  });
});
