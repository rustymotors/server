"use strict";
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const ssl_options_1 = require("./ssl-options");
const module_1 = require("module");
const fakeConfig = {
    certificate: {
        certFilename: '/cert/cert.pem',
        privateKeyFilename: '/cert/private.key',
        publicKeyFilename: '',
    },
    serverSettings: {
        ipServer: '',
    },
    serviceConnections: {
        databaseURL: '',
    },
    defaultLogLevel: 'warn',
};
globals_1.describe('sslOptions()', () => {
    globals_1.beforeEach(() => {
        // https://bensmithgall.com/blog/jest-mock-trick if this works!
        const mockStatSync = globals_1.jest.fn();
        function mockFs() {
            const original = module_1.Module.createRequire('fs');
            return { ...original, statSync: mockStatSync };
        }
        globals_1.jest.mock('fs', () => mockFs());
    });
    globals_1.afterEach(() => {
        globals_1.jest.clearAllMocks();
    });
    globals_1.it('will throw an error when unable to locate the certificate', async () => {
        //  Deepcode ignore WrongNumberOfArgs/test: false positive
        globals_1.expect(() => ssl_options_1._sslOptions(fakeConfig.certificate, 'testingSSLOptions')).toThrowError(/cert.pem/);
    });
});
//# sourceMappingURL=ssl-options.test.js.map