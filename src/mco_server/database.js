var sqlite3 = require('sqlite3').verbose()

var DB_PATH = './data/'

var dbUsers = new sqlite3.Database(DB_PATH + 'users.db')
var dbPersonas = new sqlite3.Database(DB_PATH + 'personas.db')
var dbSessions = new sqlite3.Database(DB_PATH + 'sessions.db')
var dbRaces = new sqlite3.Database(DB_PATH + 'races.db')

function dbCreateTables (callback) {
  dbUsers.run('CREATE TABLE IF NOT EXISTS users (username TEXT, password_hash TEXT, is_suspended INTEGER)')
  dbPersonas.run('CREATE TABLE IF NOT EXISTS personas (username TEXT, racer_name TEXT)')
  dbSessions.run('CREATE TABLE IF NOT EXISTS sessions (org TEXT, id INTEGER, login TEXT, avatar_url TEXT, type TEXT, PRIMARY KEY(id))')
  dbRaces.run('CREATE TABLE IF NOT EXISTS races (org TEXT, repository TEXT, id INTEGER, title TEXT, state TEXT, open_issues INTEGER, due_on TEXT, html_url TEXT, url TEXT, PRIMARY KEY(id))')
  callback()
}

function dbInsertPersonas (callback) {
  var i

  dbPersonas.serialize(function () {
    var stmtPersonas = dbPersonas.prepare('INSERT INTO personas VALUES (?, ?)')
    for (i = 0; i < 10; i++) {
      stmtPersonas.run('Lorem ' + i, 'Ipsum ' + i)
    }
    stmtPersonas.finalize(callback())
  })
}

function dbSelectPersonas (callback) {
  dbPersonas.each('SELECT rowid AS id, username, racer_name FROM personas', function (err, row) {
    if (err) {
      console.log(err)
    }
    console.log(row.id + ': ' + row.id + ' / ' + row.username + ': ' + row.username + ' / ' + row.racer_name + ': ' + row.racer_name)
  }, function () {
    callback()
  })
}

module.exports = {
  dbCreateTables: dbCreateTables,
  dbInsertPersonas: dbInsertPersonas,
  dbSelectPersonas: dbSelectPersonas
}
