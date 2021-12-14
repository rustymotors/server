"use strict";
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const index_1 = require("../src/services/MCOTS/index");
const mcotServer = new index_1.MCOTServer();
globals_1.describe('MCOTS Server', () => {
    globals_1.test('msg_string()', () => {
        globals_1.expect(mcotServer._MSG_STRING(438)).toEqual('MC_CLIENT_CONNECT_MSG');
    });
    globals_1.test('msg_string()', () => {
        globals_1.expect(mcotServer._MSG_STRING(105)).toEqual('MC_LOGIN');
    });
    globals_1.test('msg_string()', () => {
        globals_1.expect(mcotServer._MSG_STRING(106)).toEqual('MC_LOGOUT');
    });
    globals_1.test('msg_string()', () => {
        globals_1.expect(mcotServer._MSG_STRING(109)).toEqual('MC_SET_OPTIONS');
    });
    globals_1.test('msg_string()', () => {
        globals_1.expect(mcotServer._MSG_STRING(141)).toEqual('MC_STOCK_CAR_INFO');
    });
});
//# sourceMappingURL=mcots-server.test.js.map