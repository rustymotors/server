// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { MCOTServer } from "../../../MCOTS/MCOTServer";

const mcotServer = new MCOTServer();

describe("MCOTS Server", () => {
  describe("_MSG_STRING", () => {
    test("438 = MC_CLIENT_CONNECT_MSG", () => {
      expect(mcotServer._MSG_STRING(438)).toBe("MC_CLIENT_CONNECT_MSG");
    });
    test("105 = MC_LOGIN", () => {
      expect(mcotServer._MSG_STRING(105)).toBe("MC_LOGIN");
    });
    test("106 = MC_LOGOUT", () => {
      expect(mcotServer._MSG_STRING(106)).toBe("MC_LOGOUT");
    });
    test("109 = MC_SET_OPTIONS", () => {
      expect(mcotServer._MSG_STRING(109)).toBe("MC_SET_OPTIONS");
    });
    test("141 = MC_STOCK_CAR_INFO", () => {
      expect(mcotServer._MSG_STRING(141)).toBe("MC_STOCK_CAR_INFO");
    });
  });
});
