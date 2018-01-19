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

const sqlite = require('sqlite');
const logger = require('../../src/logger');

const db = sqlite.open('./data/sessions.db');

/**
 * Create the sessions database table if it does not exist
 * @param {Function} callback
 */
function createDB() {
  return new Promise((resolve, reject) => {
    db.run(
      'CREATE TABLE IF NOT EXISTS sessions (customer_id INTEGER NOT NULL UNIQUE, session_key TEXT, s_key TEXT, context_id TEXT, remote_address TEXT)',
      [],
    )
      .catch((err) => {
        reject(err);
      })
      .then((res) => {
        resolve(res);
      });
  });
}

/**
 * Fetch session key from database based on remote address
 * @param {string} remoteAddress
 */
function fetchSessionKeyByRemoteAddress(remoteAddress) {
  return new Promise((resolve, reject) => {
    sqlite.open('./data/sessions.db', { Promise }).then((db1) => {
      console.trace('Database open');
      console.dir(db1);
      db1.get(
        'SELECT session_key, s_key FROM sessions WHERE remote_address = $1',
        [remoteAddress],
      )
        .catch((err) => {
          reject(err);
        })
        .then((res) => {
          resolve(res);
        });
    });

    console.trace('I should not get here');
  });
}

function updateSessionKey(customerId, sessionKey, contextId, remoteAddress) {

  return new Promise((resolve, reject) => {
    const sKey = sessionKey.substr(0, 16);

    db.run(
      'INSERT OR REPLACE INTO sessions (customer_id, session_key, s_key, context_id, remote_address) VALUES ($1, $2, $3, $4, $5)',
      [customerId, sessionKey, sKey, contextId, remoteAddress],
    )
      .catch((err) => {
        reject(err);
      })
      .then((res) => {
        resolve(res);
      });
  });
}

module.exports = {
  createDB, fetchSessionKeyByRemoteAddress, updateSessionKey,
};
