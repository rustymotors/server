"use strict";
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const index_1 = require("../src/services/AuthLogin/index");
globals_1.test('WebServer', () => {
    try {
        // eslint-disable-next-line no-unused-vars
        const _ = new index_1.AuthLogin();
        globals_1.expect(true).toBeTruthy();
    }
    catch (error) {
        globals_1.expect(error).toBeFalsy();
    }
});
//# sourceMappingURL=web-server.test.js.map