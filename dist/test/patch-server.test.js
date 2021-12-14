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
const patch_server_1 = require("../src/services/PatchAndShard/patch-server");
let patchServer;
globals_1.describe('PatchServer', () => {
    globals_1.beforeEach(() => {
        patchServer = new patch_server_1.PatchServer();
    });
    globals_1.it('PatchServer', () => {
        globals_1.expect(patch_server_1.CastanetResponse.body.toString('hex')).toStrictEqual('cafebeef00000000000003');
        globals_1.expect(patchServer._patchUpdateInfo().body.toString('hex')).toStrictEqual('cafebeef00000000000003');
        globals_1.expect(patchServer._patchNPS().body.toString('hex')).toStrictEqual('cafebeef00000000000003');
        globals_1.expect(patchServer._patchMCO().body.toString('hex')).toStrictEqual('cafebeef00000000000003');
        globals_1.expect(patchServer._generateShardList()).toContain('The Clocktower');
        globals_1.expect(patchServer._getBans()).toStrictEqual([]);
    });
    globals_1.it('PatchServer - Shardlist', () => {
        supertest_1.default(patchServer.serverPatch)
            .get('/ShardList/')
            .then(response => {
            globals_1.expect(response.text).toContain('[The Clocktower]');
        }, error => {
            console.error(`Error: ${error}`);
        });
    });
    globals_1.it('PatchServer - UpdateInfo', () => {
        supertest_1.default(patchServer.serverPatch)
            .get('/games/EA_Seattle/MotorCity/UpdateInfo')
            .then(response => {
            globals_1.expect(response.body).toStrictEqual(patch_server_1.CastanetResponse.body);
        })
            .catch(error => {
            console.error(error);
        });
    });
    globals_1.it('PatchServer - NPS', () => {
        supertest_1.default(patchServer.serverPatch)
            .get('/games/EA_Seattle/MotorCity/NPS')
            .then(response => {
            globals_1.expect(response.body).toStrictEqual(patch_server_1.CastanetResponse.body);
        })
            .catch(error => {
            console.error(error);
        });
    });
    globals_1.it('PatchServer - MCO', done => {
        supertest_1.default(patchServer.serverPatch)
            .get('/games/EA_Seattle/MotorCity/MCO')
            .then(response => {
            globals_1.expect(response.body).toStrictEqual(patch_server_1.CastanetResponse.body);
            done();
        })
            .catch(error => {
            console.error(error);
        });
    });
    globals_1.it('PatchServer - Default', () => {
        globals_1.expect(patchServer._getBans()).toStrictEqual([]);
        // Deepcode ignore PromiseNotCaughtNode/test: This promise doesn't return an error, it seems.
        supertest_1.default(patchServer.serverPatch)
            .get('/')
            .then(
        /** @type {request.Response} */ response => {
            globals_1.expect(patchServer._getBans()).toStrictEqual([]);
            globals_1.expect(response.status).toEqual(404);
        });
        patchServer._addBan('255.255.255.255');
        globals_1.expect(patchServer._getBans()).toStrictEqual(['255.255.255.255']);
        patchServer._clearBans();
        globals_1.expect(patchServer._getBans()).toStrictEqual([]);
    });
});
//# sourceMappingURL=patch-server.test.js.map