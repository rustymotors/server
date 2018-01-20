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

/**
 * Create the sessions database table if it does not exist
 * @param {Function} callback
 */
async function createDB() {
  const db = await sqlite.open('./data/sessions.db');
  const status = await db.run(
    'CREATE TABLE IF NOT EXISTS sessions (customer_id INTEGER NOT NULL UNIQUE, session_key TEXT, s_key TEXT, context_id TEXT, remote_address TEXT)',
    [],
  );
  return status;
}

/**
 * Fetch session key from database based on remote address
 * @param {string} remoteAddress
 */
async function fetchSessionKeyByRemoteAddress(remoteAddress) {
  const db = await sqlite.open('./data/sessions.db', { Promise });
  const keys = await db.get(
    'SELECT session_key, s_key FROM sessions WHERE remote_address = $1',
    [remoteAddress],
  );
  return keys;
}

async function updateSessionKey(customerId, sessionKey, contextId, remoteAddress) {

  const sKey = sessionKey.substr(0, 16);
  const db = await sqlite.open('./data/sessions.db');
  const status = await db.run(
    'INSERT OR REPLACE INTO sessions (customer_id, session_key, s_key, context_id, remote_address) VALUES ($1, $2, $3, $4, $5)',
    [customerId, sessionKey, sKey, contextId, remoteAddress],
  );
  return status;
}

module.exports = {
  createDB, fetchSessionKeyByRemoteAddress, updateSessionKey,
};
