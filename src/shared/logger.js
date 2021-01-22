// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const appSettings = require('../../config/app-settings')
const winston = require('winston')

module.exports = winston.createLogger({
  ...{
    silllyLogConfig: {
      level: 'silly',
      transports: [
        new winston.transports.File({
          filename: './logs/silly.log'
        }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({
              format: 'YYYY-MM-DD HH:mm:ss'
            }),
            winston.format.errors({ stack: true }),
            winston.format.splat(),
            winston.format.simple(),
            winston.format.colorize({ all: true })
          )
        })
      ]
    }}
})
