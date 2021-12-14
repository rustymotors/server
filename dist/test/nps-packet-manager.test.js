"use strict";
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const nps_packet_manager_1 = require("../src/services/MCServer/nps-packet-manager");
globals_1.describe('NPSPacketManager', () => {
    globals_1.it('NPSPacketManger', async () => {
        const npsPacketManager = new nps_packet_manager_1.NPSPacketManager();
        globals_1.expect(npsPacketManager.msgCodetoName(0x2_29)).toEqual('NPS_MINI_USER_LIST');
    });
});
//# sourceMappingURL=nps-packet-manager.test.js.map