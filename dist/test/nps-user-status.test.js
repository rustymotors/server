"use strict";
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const nps_user_status_1 = require("../src/services/LoginServer/nps-user-status");
globals_1.it('NPSUserStatus', () => {
    const testPacket = Buffer.from([0x7b, 0x00]);
    const npsUserStatus = new nps_user_status_1.NPSUserStatus(testPacket);
    globals_1.expect(npsUserStatus.opCode).toEqual(123);
});
//# sourceMappingURL=nps-user-status.test.js.map