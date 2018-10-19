// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { MCOTServer } from "../src/MCOTS/MCOTServer";

const mcotServer = new MCOTServer();

test("438 = MC_CLIENT_CONNECT_MSG", () => {
  expect(mcotServer._MSG_STRING(438)).toBe("MC_CLIENT_CONNECT_MSG");
});
