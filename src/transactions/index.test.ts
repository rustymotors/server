// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import t from "tap";
import { MCOTServer } from "./index";

t.test("MCOTS Server", (t) => {
  t.test("getInstance always returns the same object", (t) => {
    const s1 = MCOTServer.getInstance();

    t.equal(typeof s1.defaultHandler, "function");

    const s2 = MCOTServer.getInstance();

    t.equal(s1, s2);
    t.end();
  });

  t.test("msg_string()", (t) => {
    const mcotServer = MCOTServer.getInstance();

    t.equal(mcotServer._MSG_STRING(438), "MC_CLIENT_CONNECT_MSG");
    t.end();
  });

  t.test("msg_string()", (t) => {
    const mcotServer = MCOTServer.getInstance();

    t.equal(mcotServer._MSG_STRING(105), "MC_LOGIN");
    t.end();
  });

  t.test("msg_string()", (t) => {
    const mcotServer = MCOTServer.getInstance();

    t.equal(mcotServer._MSG_STRING(106), "MC_LOGOUT");
    t.end();
  });

  t.test("msg_string()", (t) => {
    const mcotServer = MCOTServer.getInstance();

    t.equal(mcotServer._MSG_STRING(109), "MC_SET_OPTIONS");
    t.end();
  });

  t.test("msg_string()", (t) => {
    const mcotServer = MCOTServer.getInstance();

    t.equal(mcotServer._MSG_STRING(141), "MC_STOCK_CAR_INFO");
    t.end();
  });

  t.test("msg_string()", (t) => {
    const mcotServer = MCOTServer.getInstance();

    t.equal(mcotServer._MSG_STRING(213), "MC_LOGIN_COMPLETE");
    t.end();
  });

  t.test("msg_string()", (t) => {
    const mcotServer = MCOTServer.getInstance();

    t.equal(mcotServer._MSG_STRING(266), "MC_UPDATE_PLAYER_PHYSICAL");
    t.end();
  });

  t.test("msg_string()", (t) => {
    const mcotServer = MCOTServer.getInstance();

    t.equal(mcotServer._MSG_STRING(324), "MC_GET_LOBBIES");
    t.end();
  });

  t.test("msg_string()", (t) => {
    const mcotServer = MCOTServer.getInstance();

    t.equal(mcotServer._MSG_STRING(325), "MC_LOBBIES");
    t.end();
  });

  t.test("msg_string()", (t) => {
    const mcotServer = MCOTServer.getInstance();

    t.equal(mcotServer._MSG_STRING(440), "MC_TRACKING_MSG");
    t.end();
  });

  t.test("msg_string()", (t) => {
    const mcotServer = MCOTServer.getInstance();

    t.equal(mcotServer._MSG_STRING(999), "Unknown");
    t.end();
  });
  t.end();
});
