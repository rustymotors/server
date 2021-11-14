// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const t = require("tap");
const { NPSPacketManager } = require("../src/nps-packet-manager.js");

t.test("NPSPacketManager", (t) => {
  t.test("NPSPacketManger", async (t) => {
    const npsPacketManager = new NPSPacketManager();
    t.equal(npsPacketManager.msgCodetoName(0x2_29), "NPS_MINI_USER_LIST");
    t.end();
  });
  t.end();
});
