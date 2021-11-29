// @ts-check
// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { readFileSync } from "fs";
import { logger } from "../logger/index";
import { SslOptions } from "../types";

const log = logger.child({ service: "mcoserver:AdminServer;" });

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
export function _sslOptions(): SslOptions {
  if (!process.env.MCOS__CERTIFICATE__PRIVATE_KEY_FILE) {
    throw new Error("Please set MCOS__CERTIFICATE__PRIVATE_KEY_FILE");
  }
  if (!process.env.MCOS__CERTIFICATE__CERTIFICATE_FILE) {
    throw new Error("Please set MCOS__CERTIFICATE__CERTIFICATE_FILE");
  }

  log.debug(`Reading ${process.env.MCOS__CERTIFICATE__CERTIFICATE_FILE}`);

  let cert = "";
  let key = "";

  try {
    cert = readFileSync(process.env.MCOS__CERTIFICATE__CERTIFICATE_FILE, {
      encoding: "utf-8",
    });
  } catch (error) {
    throw new Error(
      `Error loading ${process.env.MCOS__CERTIFICATE__CERTIFICATE_FILE}: (${error}), server must quit!`
    );
  }

  try {
    key = readFileSync(process.env.MCOS__CERTIFICATE__PRIVATE_KEY_FILE, {
      encoding: "utf-8",
    });
  } catch (error) {
    throw new Error(
      `Error loading ${process.env.MCOS__CERTIFICATE__PRIVATE_KEY_FILE}: (${error}), server must quit!`
    );
  }

  return {
    cert,
    honorCipherOrder: true,
    key,
    rejectUnauthorized: false,
  };
}
