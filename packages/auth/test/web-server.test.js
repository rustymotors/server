// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const t = require("tap");
const { AuthLogin } = require("../src/index.js");

t.test("WebServer", (t) => {
  const _ = AuthLogin.getInstance();
  t.match(_._handleGetTicket(), /TRUE/);
  t.end();
});
