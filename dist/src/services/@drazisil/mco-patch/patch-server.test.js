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
let patchServer;
globals_1.describe('PatchServer', () => {
    globals_1.beforeEach(() => {
        patchServer = _1.PatchServer.getInstance();
    });
    globals_1.it('PatchServer', () => {
        globals_1.expect(_1.CastanetResponse.body.toString('hex')).toStrictEqual('cafebeef00000000000003');
    });
    globals_1.it('PatchServer - UpdateInfo', () => {
        supertest_1.default(patchServer._server)
            .get('/games/EA_Seattle/MotorCity/UpdateInfo')
            .then(response => {
            globals_1.expect(response.body).toStrictEqual(_1.CastanetResponse.body);
        })
            .catch(error => {
            console.error(error);
        });
    });
    globals_1.it('PatchServer - NPS', () => {
        supertest_1.default(patchServer._server)
            .get('/games/EA_Seattle/MotorCity/NPS')
            .then(response => {
            globals_1.expect(response.body).toStrictEqual(_1.CastanetResponse.body);
        })
            .catch(error => {
            console.error(error);
        });
    });
    globals_1.it('PatchServer - MCO', done => {
        supertest_1.default(patchServer._server)
            .get('/games/EA_Seattle/MotorCity/MCO')
            .then(response => {
            globals_1.expect(response.body).toStrictEqual(_1.CastanetResponse.body);
            done();
        })
            .catch(error => {
            console.error(error);
        });
    });
});
//# sourceMappingURL=patch-server.test.js.map