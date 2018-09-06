// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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
