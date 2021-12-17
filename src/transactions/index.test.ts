// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import test from "ava";
import { MCOTServer } from "./index";

  test("MCOTS Server - getInstance always returns the same object", (t) => {
    const s1 = MCOTServer.getInstance();

    t.is(typeof s1.defaultHandler, "function");

    const s2 = MCOTServer.getInstance();

    t.is(s1, s2);

  });

  test("MCOTS Server - msg_string() 1", (t) => {
    const mcotServer = MCOTServer.getInstance();

    t.is(mcotServer._MSG_STRING(438), "MC_CLIENT_CONNECT_MSG");

  });

  test("MCOTS Server - msg_string() 2", (t) => {
    const mcotServer = MCOTServer.getInstance();

    t.is(mcotServer._MSG_STRING(105), "MC_LOGIN");

  });

  test("MCOTS Server - msg_string() 3", (t) => {
    const mcotServer = MCOTServer.getInstance();

    t.is(mcotServer._MSG_STRING(106), "MC_LOGOUT");

  });

  test("MCOTS Server - msg_string() 4", (t) => {
    const mcotServer = MCOTServer.getInstance();

    t.is(mcotServer._MSG_STRING(109), "MC_SET_OPTIONS");

  });

  test("MCOTS Server - msg_string() 5", (t) => {
    const mcotServer = MCOTServer.getInstance();

    t.is(mcotServer._MSG_STRING(141), "MC_STOCK_CAR_INFO");

  });

  test("MCOTS Server - msg_string() 6", (t) => {
    const mcotServer = MCOTServer.getInstance();

    t.is(mcotServer._MSG_STRING(213), "MC_LOGIN_COMPLETE");

  });

  test("MCOTS Server - msg_string() 7", (t) => {
    const mcotServer = MCOTServer.getInstance();

    t.is(mcotServer._MSG_STRING(266), "MC_UPDATE_PLAYER_PHYSICAL");

  });

  test("MCOTS Server - msg_string() 8", (t) => {
    const mcotServer = MCOTServer.getInstance();

    t.is(mcotServer._MSG_STRING(324), "MC_GET_LOBBIES");

  });

  test("MCOTS Server - msg_string() 9", (t) => {
    const mcotServer = MCOTServer.getInstance();

    t.is(mcotServer._MSG_STRING(325), "MC_LOBBIES");

  });

  test("MCOTS Server - msg_string() 10", (t) => {
    const mcotServer = MCOTServer.getInstance();

    t.is(mcotServer._MSG_STRING(440), "MC_TRACKING_MSG");

  });

  test("MCOTS Server - msg_string() 11", (t) => {
    const mcotServer = MCOTServer.getInstance();

    t.is(mcotServer._MSG_STRING(999), "Unknown");

  });
