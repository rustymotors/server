// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import t from "tap";
import { MCOTServer } from "../src/index";

const mcotServer = MCOTServer.getInstance();

t.test("MCOTS Server", (t) => {
  t.test("msg_string()", (t) => {
    t.equal(mcotServer._MSG_STRING(438), "MC_CLIENT_CONNECT_MSG");
    t.end()
  });

  t.test("msg_string()", (t) => {
    t.equal(mcotServer._MSG_STRING(105), "MC_LOGIN");
    t.end()
  });

  t.test("msg_string()", (t) => {
    t.equal(mcotServer._MSG_STRING(106), "MC_LOGOUT");
    t.end()
  });

  t.test("msg_string()", (t) => {
    t.equal(mcotServer._MSG_STRING(109), "MC_SET_OPTIONS");
    t.end()
  });

  t.test("msg_string()", (t) => {
    t.equal(mcotServer._MSG_STRING(141), "MC_STOCK_CAR_INFO");
    t.end()
  });
  t.end()
});
