"use strict";
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const index_1 = require("./index");
globals_1.test('WebServer', () => {
    const _ = index_1.AuthLogin.getInstance();
    globals_1.expect(_._handleGetTicket()).toEqual(globals_1.expect.stringMatching(/TRUE/));
});
//# sourceMappingURL=web-server.test.js.map