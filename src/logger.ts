// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as winston from "winston";

// tslint:disable-next-line:no-empty-interface
export interface ILoggerInstance extends winston.Logger {}

export class Logger {
  public level: string;
  public logger: winston.Logger;

  constructor(level: string = "debug") {
    this.level = level;
    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.simple()
      ),
      transports: [
        new winston.transports.Console({ level }),
        new winston.transports.File({
          filename: "logs/mcoServer.log",
          level,
        }),
      ],
    });
  }

  public getLogger() {
    return this.logger;
  }
}
