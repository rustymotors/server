"use strict";
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const nps_user_info_1 = require("../src/services/LobbyServer/nps-user-info");
const message_node_1 = require("../src/services/MCOTS/message-node");
globals_1.it('NPSUserInfo', () => {
    const testPacket = Buffer.concat([
        Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x84, 0x5f, 0xed]),
        Buffer.alloc(98),
    ]);
    const npsUserInfo = new nps_user_info_1.NPSUserInfo(message_node_1.EMessageDirection.RECEIVED);
    npsUserInfo.deserialize(testPacket);
    globals_1.expect(npsUserInfo.userId).toEqual(8_675_309);
});
//# sourceMappingURL=nps-user-info.test.js.map