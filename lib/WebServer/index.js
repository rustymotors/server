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

const async = require('async');
const web = require('./web.js');
const patchServer = require('./patchServer.js');
const logger = require('../../src/logger.js');

/**
 * Start HTTP and HTTPs connection listeners
 * TODO: This code may be better suited in web.js and patchServer.js
 * @param {Function} callback
 */
function start(callback) {
  /* Start the NPS servers */

  async.series(
    {
      patchServer(callback) {
        patchServer.start((err) => {
          if (err) {
            logger.error(err.message);
            logger.error(err.stack);
            process.exit(1);
          }
          callback(null);
        });
      },
      web(callback) {
        web.start((err) => {
          if (err) {
            logger.error(err.message);
            logger.error(err.stack);
            process.exit(1);
          }
          callback(null);
        });
      },
    },
    (err, results) => {
      logger.info('Patch Server started');
      logger.info('Web Server started');
      callback();
    },
  );
}

module.exports = { start };
