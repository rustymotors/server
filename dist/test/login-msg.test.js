"use strict";
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const login_msg_1 = require("../src/services/MCOTS/login-msg");
const inboundBuffer = Buffer.alloc(42);
inboundBuffer.write('NotAPerson', 24);
inboundBuffer.write('0.0.0.0', 34);
const loginMessage1 = new login_msg_1.LoginMessage(inboundBuffer);
globals_1.it('LoginMsg', () => {
    const { appId, toFrom, msgNo, customerId, personaId, lotOwnerId, brandedPartId, skinId, personaName, version, data, } = loginMessage1;
    globals_1.expect(appId).toEqual(0);
    globals_1.expect(toFrom).toEqual(0);
    globals_1.expect(msgNo).toEqual(0);
    globals_1.expect(customerId).toEqual(0);
    globals_1.expect(personaId).toEqual(0);
    globals_1.expect(lotOwnerId).toEqual(0);
    globals_1.expect(brandedPartId).toEqual(0);
    globals_1.expect(skinId).toEqual(0);
    globals_1.expect(personaName).toContain('NotAPerson');
    globals_1.expect(version).toContain('0.0.0.0');
    globals_1.expect(data).toEqual(inboundBuffer);
});
//# sourceMappingURL=login-msg.test.js.map