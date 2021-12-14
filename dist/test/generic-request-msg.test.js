"use strict";
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const generic_request_msg_1 = require("../src/services/MCServer/generic-request-msg");
const genericRequestMessage1 = new generic_request_msg_1.GenericRequestMessage();
globals_1.it('GenericRequestMsg', () => {
    const { msgNo } = genericRequestMessage1;
    globals_1.expect(msgNo).toEqual(0);
    globals_1.expect(genericRequestMessage1.serialize()).toStrictEqual(Buffer.alloc(16));
});
//# sourceMappingURL=generic-request-msg.test.js.map