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
const nps_persona_maps_msg_1 = require("../src/services/PersonaServer/nps-persona-maps-msg");
globals_1.it('NPSPersonaMapsMsg', () => {
    const npsPersonaMapsMessage = new nps_persona_maps_msg_1.NPSPersonaMapsMessage(message_node_1.EMessageDirection.RECEIVED);
    globals_1.expect(npsPersonaMapsMessage.direction).toEqual(message_node_1.EMessageDirection.RECEIVED);
    globals_1.expect(npsPersonaMapsMessage.msgNo).toEqual(0x6_07);
});
//# sourceMappingURL=nps-persona-maps-msg.test.js.map