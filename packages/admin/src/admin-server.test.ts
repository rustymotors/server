// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect, test, jest } from "@jest/globals";
import { MCServer } from "@mco-server/core";
import { AdminServer } from "./index";
jest.mock("@mco-server/core");
jest.mock("net");

test("AdminServer", () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = AdminServer.getInstance(MCServer.getInstance());
    expect(true).toBeTruthy();
  } catch (error) {
    expect(error).toBeFalsy();
  }
});
