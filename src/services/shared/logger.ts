// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as winston from "winston";
import * as DailyRotateFile from "winston-daily-rotate-file";

// tslint:disable-next-line:no-empty-interface
export interface ILoggerInstance extends winston.Logger {}

export class Logger {
  public loggingLevel: string;
  public logger: winston.Logger;

  constructor(level: string = "debug") {
    this.loggingLevel = level;
    const consoleFormat = winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.simple()
    );
    this.logger = winston.createLogger({
      transports: [
        new winston.transports.Console({ level, format: consoleFormat }),
        new DailyRotateFile({
          filename: "logs/mcoServer-%DATE%.log",
          level,
          datePattern: "YYYY-MM-DD-HH",
          zippedArchive: true,
        }),
      ],
    });
  }

  public getLogger() {
    return this.logger;
  }
}
