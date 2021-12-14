"use strict";
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const index_1 = require("../src/services/AdminServer/index");
const index_2 = require("../src/services/MCServer/index");
globals_1.jest.mock('../src/services/MCServer/index');
globals_1.test('AdminServer', () => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _ = index_1.AdminServer.getInstance(index_2.MCServer.getInstance());
        globals_1.expect(true).toBeTruthy();
    }
    catch (error) {
        globals_1.expect(error).toBeFalsy();
    }
});
//# sourceMappingURL=admin-server.test.js.map