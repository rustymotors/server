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

const { Logger, transports } = require('winston');

const logger = new Logger({
  transports: [
    new transports.Console({ level: 'debug', colorize: 'all' }),
    new transports.File({
      filename: 'filelog-info.log',
      level: 'info',
      name: 'info-file',
    }),
    new transports.File({
      filename: 'filelog-error.log',
      level: 'error',
      name: 'error-file',
    }),
  ],
});

module.exports = { logger };
