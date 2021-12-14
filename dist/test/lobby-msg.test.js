"use strict";
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const lobby_info_1 = require("../src/services/MCOTS/lobby-info");
const lobby_msg_1 = require("../src/services/MCOTS/lobby-msg");
const lobbyInfo1 = new lobby_info_1.LobbyInfoPacket();
const lobbyMessage1 = new lobby_msg_1.LobbyMessage();
globals_1.it('LobbyInfo', () => {
    globals_1.expect(lobbyInfo1.toPacket().length).toEqual(567);
});
globals_1.it('LobbyMsg', () => {
    globals_1.expect(lobbyMessage1.data.length).toEqual(572);
});
//# sourceMappingURL=lobby-msg.test.js.map