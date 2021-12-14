"use strict";
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const supertest_1 = __importDefault(require("supertest"));
const _1 = require(".");
let shardServer;
globals_1.describe('ShardServer', () => {
    globals_1.beforeEach(() => {
        shardServer = _1.ShardServer.getInstance();
    });
    globals_1.it('should return a shard list', () => {
        supertest_1.default(shardServer._server)
            .get('/ShardList/')
            .then(response => {
            globals_1.expect(response.text).toContain('[The Clocktower]');
        }, error => {
            console.error(`Error: ${error}`);
        });
    });
});
//# sourceMappingURL=shard-server.test.js.map