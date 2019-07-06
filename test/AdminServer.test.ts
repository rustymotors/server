// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
import { AdminServer } from "../src/AdminServer";
import { Logger } from "../src/services/shared/logger";
import { MCServer } from "../src/MCServer";

const loggers = new Logger().getLoggers();
const adminServer = new AdminServer(new MCServer(loggers), loggers.both);

describe("AdminServer", () => {
  test("has instance of MCServer", () => {
    expect(adminServer.mcServer).toBeInstanceOf(MCServer);
  });
  test("has instance of Logger", () => {
    expect(adminServer.logger).toBe(loggers.both);
  });
});
