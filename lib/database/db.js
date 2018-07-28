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

const { logger } = require("../../src/logger")
const pool = require("./")

/**
 * Create the sessions database table if it does not exist
 * @param {Function} callback
 */
async function createDB() {

    return pool.connect().then(pool.query(
        `CREATE TABLE IF NOT EXISTS sessions (customer_id INTEGER NOT NULL UNIQUE, 
      session_key TEXT, s_key TEXT, context_id TEXT, connection_id INTEGER)`,
        [],
    )).catch((e) => {
        if (e.code === "ENOTFOUND") {
            logger.error(`Error connecting to database: ${e}`)
            process.exit(1)
        } else {
            console.trace(e);
        };
    });
}

/**
 * Fetch session key from database based on remote address
 * @param {string} remoteAddress
 */
async function fetchSessionKeyByConnectionId(connectionId) {
    return pool.connect().then(
        pool.query(
            "SELECT session_key, s_key FROM sessions WHERE connection_id = $1",
            [connectionId],
        )).catch((e) => { console.trace(e); });
}

async function updateSessionKey(customerId, sessionKey, contextId, connectionId) {
    const sKey = sessionKey.substr(0, 16);
    return pool.connect().then(pool.query(
        `INSERT INTO sessions (customer_id, session_key, s_key, context_id, 
      connection_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (customer_id) DO UPDATE SET session_key = $2, s_key = $3, context_id = $4, connection_id = $5`,
        [customerId, sessionKey, sKey, contextId, connectionId],
    )).catch((e) => { console.trace(e); });
}

module.exports = { createDB, updateSessionKey, updateSessionKey }