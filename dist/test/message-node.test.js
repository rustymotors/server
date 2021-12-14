"use strict";
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const message_node_1 = require("../src/services/MCOTS/message-node");
const messageNode1 = new message_node_1.MessageNode(message_node_1.EMessageDirection.RECEIVED);
messageNode1.deserialize(Buffer.from([
    0x00, 0x00, 0x54, 0x4f, 0x4d, 0x43, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
]));
globals_1.it('MessageNode', () => {
    globals_1.expect(() => {
        new message_node_1.MessageNode(message_node_1.EMessageDirection.RECEIVED).deserialize(Buffer.from([0x00, 0x00]));
    }).toThrow('[MessageNode] Not long enough to deserialize, only 2 bytes long');
    globals_1.expect(messageNode1.isMCOTS()).toBeTruthy();
    try {
        messageNode1.dumpPacket();
    }
    catch (error) {
        globals_1.expect(error).not.toBeNull();
    }
});
//# sourceMappingURL=message-node.test.js.map