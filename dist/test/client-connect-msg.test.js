"use strict";
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const client_connect_msg_1 = require("../src/services/MCServer/client-connect-msg");
globals_1.it('ClientConnectMsg', () => {
    const clientConnectMessage1 = new client_connect_msg_1.ClientConnectMessage(Buffer.concat([
        Buffer.from([0xb6, 0x01]),
        Buffer.from('TOMC'),
        Buffer.alloc(12),
    ]));
    globals_1.expect(clientConnectMessage1.msgNo).toEqual(438);
});
//# sourceMappingURL=client-connect-msg.test.js.map