var sqlite3 = require('sqlite3').verbose()

var DB_PATH = './data/'

var dbUsers = new sqlite3.Database(DB_PATH + 'users.db')
var dbPersonas = new sqlite3.Database(DB_PATH + 'personas.db')
var dbSessions = new sqlite3.Database(DB_PATH + 'sessions.db')
var dbRaces = new sqlite3.Database(DB_PATH + 'races.db')

function dbCreateTables (callback) {
  dbUsers.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, passwordhash TEXT, customerid TEXT UNQUE, is_suspended INTEGER)', function (err, res) {
    if (err) callback(err)
    dbPersonas.run('CREATE TABLE IF NOT EXISTS personas (id INTEGER PRIMARY KEY AUTOINCREMENT, customerid TEXT UNIQUE, racername TEXT UNIQUE, shard TEXT)', function (err, res) {
      if (err) callback(err)
      dbSessions.run('CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, customerid INTEGER session_id TEXT UNIQUE, hostname TEXT, ipaddress TEXT UNIQUE, session_key TEXT)', function (err, res) {
        if (err) callback(err)
        dbRaces.run('CREATE TABLE IF NOT EXISTS races (id INTEGER PRIMARY KEY AUTOINCREMENT, org TEXT, repository TEXT, title TEXT, state TEXT, openissues INTEGER, due_on TEXT, html_url TEXT, url TEXT)', function (err, res) {
          if (err) callback(err)
          callback(null, res)
        })
      })
    })
  })
}

function dbInsertPersonas (callback) {
  var i

  dbPersonas.serialize(function () {
    var stmtPersonas = dbPersonas.prepare('INSERT OR REPLACE INTO personas VALUES (?, ?, ?, ?)')
    for (i = 0; i < 10; i++) {
      stmtPersonas.run(null, 'Zeta ' + i, 'Lorem ' + i, 'Ipsum ' + i, function (err, res) {
        if (err) callback(err)
      })
    }
    stmtPersonas.finalize(function (err, res) {
      if (err) callback(err)
      callback(null, res)
    })
  })
}

function dbDeletePersonas (callback) {
  var i

  dbPersonas.serialize(function () {
    var stmtPersonas = dbPersonas.prepare('DELETE FROM personas WHERE customerid = ?')
    for (i = 0; i < 10; i++) {
      stmtPersonas.run('Zeta ' + i, function (err, res) {
        if (err) callback(err)
      })
    }
    stmtPersonas.finalize(function (err, res) {
      if (err) callback(err)
      callback(null, res)
    })
  })
}

function dbFetchAllPersonas (callback) {
  var results = {}
  results.rows = []
  dbPersonas.each('SELECT id, customerid, racername FROM personas', function (err, row) {
    if (err) callback(err)
    var resultLine = {}
    resultLine.id = row.id
    resultLine.customer_id = row.customerid
    resultLine.racer_name = row.racername
    results.rows.push(resultLine)
  }, function () {
    callback(null, JSON.stringify(results))
  })
}

function dbFetchPersonaByCustomerId (customer_id, callback) {
  var sql = 'SELECT id, customerid, racername FROM personas WHERE customerid = ?'
  dbPersonas.get(sql, customer_id, function (err, row) {
    if (err) callback(err)
    var resultLine = {}
    resultLine.id = row.id
    resultLine.customer_id = row.customerid
    resultLine.racer_name = row.racername
    callback(null, JSON.stringify(resultLine))
  })
}

module.exports = {
  dbCreateTables: dbCreateTables,
  dbInsertPersonas: dbInsertPersonas,
  dbDeletePersonas: dbDeletePersonas,
  dbFetchAllPersonas: dbFetchAllPersonas,
  dbFetchPersonaByCustomerId: dbFetchPersonaByCustomerId
}
