"use strict";
// @ts-check
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
Object.defineProperty(exports, "__esModule", { value: true });
exports._sslOptions = void 0;
const fs_1 = require("fs");
const mco_logger_1 = require("@drazisil/mco-logger");
const { log } = mco_logger_1.Logger.getInstance();
/**
 *
 * @typedef {Object} sslOptionsObj
 * @property {string} cert
 * @property {boolean} honorCipherOrder
 * @property {string} key
 * @property {boolean} rejectUnauthorized
 */
/**
   *
 * @param {Object} certificateSettings
 * @param {string} certificateSettings.privateKeyFilename
 * @param {string} certificateSettings.publicKeyFilename
 * @param {string} certificateSettings.certFilename
 * @param {string} serviceName

   * @return {Promise<sslOptionsObj>}
   */
function _sslOptions(certificateSettings, serviceName) {
    log('debug', `Reading ${certificateSettings.certFilename}`, {
        service: serviceName,
    });
    let cert;
    let key;
    try {
        cert = fs_1.readFileSync(certificateSettings.certFilename, {
            encoding: 'utf-8',
        });
    }
    catch (error) {
        throw new Error(`Error loading ${certificateSettings.certFilename}: (${error}), server must quit!`);
    }
    try {
        key = fs_1.readFileSync(certificateSettings.privateKeyFilename, {
            encoding: 'utf-8',
        });
    }
    catch (error) {
        throw new Error(`Error loading ${certificateSettings.privateKeyFilename}: (${error}), server must quit!`);
    }
    return {
        cert,
        honorCipherOrder: true,
        key,
        rejectUnauthorized: false,
    };
}
exports._sslOptions = _sslOptions;
//# sourceMappingURL=ssl-options.js.map