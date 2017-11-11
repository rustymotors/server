var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("./data/sessions.db");

function createDB(callback) {
  db.serialize(function() {
    db.run(
      "CREATE TABLE IF NOT EXISTS sessions (customer_id INTEGER NOT NULL, session_key TEXT, s_key TEXT, context_id TEXT, remote_address TEXT)",
      [],
      callback
    );
  });
}

module.exports = { db, createDB };
