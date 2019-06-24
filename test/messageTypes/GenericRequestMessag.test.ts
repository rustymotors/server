// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { GenericRequestMsg } from "../../services/shared/messageTypes/GenericRequestMsg";

const genericRequestMsg1 = new GenericRequestMsg();

describe("GenericRequestMsg", () => {
  const { msgNo } = genericRequestMsg1;
  test("msgNo is correct", () => {
    expect(msgNo).toBe(0);
  });
});
