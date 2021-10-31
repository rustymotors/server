// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import t from "tap";
import { MCServer } from "mcos-core";
import { AdminServer } from "../src/index";
t.mock("mcos-core", {});

t.test("AdminServer", (t) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = AdminServer.getInstance(MCServer.getInstance());
    t.ok(true, "", { todo: true });
  } catch (error) {
    t.notOk(error, "", {});
  }
  t.end();
});
