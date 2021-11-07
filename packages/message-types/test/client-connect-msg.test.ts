// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import t from "tap";
import { ClientConnectMessage } from "../src/index";

t.test("ClientConnectMsg", (t) => {
  const clientConnectMessage1 = new ClientConnectMessage(
    Buffer.concat([
      Buffer.from([0xb6, 0x01]),
      Buffer.from("TOMC"),
      Buffer.alloc(12),
    ])
  );

  t.equal(clientConnectMessage1.msgNo, 438);
  t.end();
});
