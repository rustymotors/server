"use strict";
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
Object.defineProperty(exports, "__esModule", { value: true });
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
const globals_1 = require("@jest/globals");
const generic_reply_msg_1 = require("../src/services/MCServer/generic-reply-msg");
const genericReplyMessage1 = new generic_reply_msg_1.GenericReplyMessage();
globals_1.it('GenericReplyMsg', () => {
    const { msgNo, toFrom } = genericReplyMessage1;
    globals_1.expect(msgNo).toEqual(0);
    globals_1.expect(toFrom).toEqual(0);
    globals_1.expect(genericReplyMessage1.serialize()).toStrictEqual(Buffer.alloc(16));
});
//# sourceMappingURL=generic-reply-msg.test.js.map