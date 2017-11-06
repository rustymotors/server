var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(":memory:");

module.exports = {
  query: (text, params, callback) => {
    db.serialize(function() {
      db.run(text, params, callback);
    });
  },
};
