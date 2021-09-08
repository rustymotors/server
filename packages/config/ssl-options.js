/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-check
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { readFileSync } from 'fs'
import { Logger } from '@drazisil/mco-logger'

const { log } = Logger.getInstance()

/**
 *
 * @param {import('../../config').IAppConfiguration['certificate']} certificateSettings
 * @param {string} serviceName
 * @return {ISslOptions}
 */
export function _sslOptions(certificateSettings, serviceName) {
  log('debug', `Reading ${certificateSettings.certFilename}`, {
    service: serviceName,
  })

  /** @type {ISslOptions["cert"]} */
  let cert
  /** @type {ISslOptions["key"]} */
  let key

  try {
    cert = readFileSync(certificateSettings.certFilename, {
      encoding: 'utf-8',
    })
  } catch (error) {
    throw new Error(
      `Error loading ${certificateSettings.certFilename}: (${error}), server must quit!`,
    )
  }

  try {
    key = readFileSync(certificateSettings.privateKeyFilename, {
      encoding: 'utf-8',
    })
  } catch (error) {
    throw new Error(
      `Error loading ${certificateSettings.privateKeyFilename}: (${error}), server must quit!`,
    )
  }

  return {
    cert,
    honorCipherOrder: true,
    key,
    rejectUnauthorized: false,
  }
}
