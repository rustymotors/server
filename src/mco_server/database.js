var sqlite3 = require('sqlite3').verbose()

var dbUsers
var dbPersonas
var dbSessions
var dbRaces

function init (path) {
  dbUsers = new sqlite3.Database(path + 'users.db');
  dbPersonas = new sqlite3.Database(path + 'personas.db');
  dbSessions = new sqlite3.Database(path + 'sessions.db');
  dbRaces = new sqlite3.Database(path + 'races.db');

  dbUsers.serialize(function() {
    db.run("CREATE TABLE lorem (info TEXT)");

    var stmt = dbUsers.prepare("INSERT INTO lorem VALUES (?)");
    for (var i = 0; i < 10; i++) {
      stmt.run("Ipsum " + i);
    }
    stmt.finalize();

    dbUsers.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
      console.log(row.id + ": " + row.info);
    });
  });

  dbUsers.close();
}

module.exports = {
  init: init
}