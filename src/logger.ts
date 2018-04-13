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

import * as config from "dotenv";
import * as winston from "winston"

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      filename: 'filelog-info.log',
      level: 'info',
      name: 'info-file',
    }),
    new (winston.transports.File)({
      filename: 'filelog-error.log',
      level: 'error',
      name: 'error-file',
    })
  ]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
// 
if (process.env.NODE_ENV !== 'production') {
  logger.cli();
}

// export interface ILoggerOptions {
//   level: string;
//   filename?: string;
//   datePattern?: string;
// }

// export class Logger {
//   private level: string;

//   constructor(options: ILoggerOptions) {
//     this.level = options.level;
//   }

//   public error(...message: string[]) {
//     process.stderr.write(`[ERROR] ${message.join(' ')} \n`);
//   }

//   public debug(...message: string[]) {
//     process.stdout.write(`[DEBUG] ${message.join(' ')} \n`);
//   }

//   public info(...message: string[]) {
//     process.stdout.write(`[INFO] ${message.join(' ')} \n`);
//   }

//   public warn(...message: string[]) {
//     process.stdout.write(`[WARN] ${message.join(' ')} \n`);
//   }

// }


// export const logger = new Logger({ level: process.env.LOGGER_LEVEL || "error" });

export { logger }

