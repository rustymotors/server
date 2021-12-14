"use strict";
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const index_1 = require("../src/services/LobbyServer/index");
globals_1.it('LobbyServer', () => {
    const lobbyServer = new index_1.LobbyServer();
    globals_1.expect(lobbyServer._generateSessionKeyBuffer('123').length).toEqual(64);
    globals_1.expect(lobbyServer._npsHeartbeat().msgNo).toEqual(0x01_27);
});
//# sourceMappingURL=lobby-server.test.js.map