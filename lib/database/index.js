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

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("./data/sessions.db");

/**
 * Create the sessions database table if it does not exist
 * @param {Function} callback 
 */
function createDB(callback) {
  db.serialize(function() {
    db.run(
      "CREATE TABLE IF NOT EXISTS sessions (customer_id INTEGER NOT NULL UNIQUE, session_key TEXT, s_key TEXT, context_id TEXT, remote_address TEXT)",
      [],
      callback
    );
  });
}

module.exports = { db, createDB };
