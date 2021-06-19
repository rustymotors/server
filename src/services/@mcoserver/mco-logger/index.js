// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

require('dotenv').config()
const winston = require('winston')

/**
 * @module MCO_Logger
 */

const level = process.env.MCO_LOG_LEVEL || 'silly'

/**
 * Provides a shared logging abstraction
  * @type {winston.Logger}
  */
module.exports = winston.createLogger({
  ...{
    level,
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss.SSS'
          }),
          winston.format.errors({ stack: true }),
          winston.format.splat(),
          winston.format.simple(),
          winston.format.colorize({ all: true })
        )
      })
    ]
  }
})
