const sqlite3 = require('sqlite3').verbose()
const series = require('async/series')

const DB_PATH = './data/'

const dbUsers = new sqlite3.Database(`${DB_PATH}users.db`)
const dbPersonas = new sqlite3.Database(`${DB_PATH}personas.db`)
const dbSessions = new sqlite3.Database(`${DB_PATH}sessions.db`)
const dbRaces = new sqlite3.Database(`${DB_PATH}races.db`)

function dbCreateTables(callback) {
  series({
    users: () => { dbUsers.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, passwordhash TEXT, customerid TEXT UNQUE, is_suspended INTEGER)') },
    personas: () => { dbPersonas.run('CREATE TABLE IF NOT EXISTS personas (id INTEGER PRIMARY KEY AUTOINCREMENT, customerid TEXT UNIQUE, racername TEXT UNIQUE, shard TEXT)') },
    sessions: () => { dbSessions.run('CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, customerid INTEGER session_id TEXT UNIQUE, hostname TEXT, ipaddress TEXT UNIQUE, session_key TEXT)') },
    races: () => { dbRaces.run('CREATE TABLE IF NOT EXISTS races (id INTEGER PRIMARY KEY AUTOINCREMENT, org TEXT, repository TEXT, title TEXT, state TEXT, openissues INTEGER, due_on TEXT, html_url TEXT, url TEXT)') },
  }, callback)
}

function dbInsertPersonas(callback) {
  dbPersonas.serialize(() => {
    const stmtPersonas = dbPersonas.prepare('INSERT OR REPLACE INTO personas VALUES (?, ?, ?, ?)')
    for (let i = 0; i < 10; i + 1) {
      stmtPersonas.run(null, `Zeta ${i}`, `Lorem ${i}`, `Ipsum ${i}`, (err) => {
        if (err) callback(err)
      })
    }
    stmtPersonas.finalize((err, res) => {
      if (err) callback(err)
      callback(null, res)
    })
  })
}

function dbDeletePersonas(callback) {
  dbPersonas.serialize(() => {
    const stmtPersonas = dbPersonas.prepare('DELETE FROM personas WHERE customerid = ?')
    for (let i = 0; i < 10; i + 1) {
      stmtPersonas.run(`Zeta ${i}`, (err) => {
        if (err) callback(err)
      })
    }
    stmtPersonas.finalize((err, res) => {
      if (err) callback(err)
      callback(null, res)
    })
  })
}

function dbFetchAllPersonas(callback) {
  const results = {}
  results.rows = []
  dbPersonas.each('SELECT id, customerid, racername FROM personas', (err, row) => {
    if (err) callback(err)
    const resultLine = {}
    resultLine.id = row.id
    resultLine.customer_id = row.customerid
    resultLine.racer_name = row.racername
    results.rows.push(resultLine)
  }, () => {
    callback(null, JSON.stringify(results))
  })
}

function dbFetchPersonaByCustomerId(customerId, callback) {
  const sql = 'SELECT id, customerid, racername FROM personas WHERE customerid = ?'
  dbPersonas.get(sql, customerId, (err, row) => {
    if (err) callback(err)
    const resultLine = {}
    resultLine.id = row.id
    resultLine.customer_id = row.customerid
    resultLine.racer_name = row.racername
    callback(null, JSON.stringify(resultLine))
  })
}

module.exports = {
  dbCreateTables,
  dbInsertPersonas,
  dbDeletePersonas,
  dbFetchAllPersonas,
  dbFetchPersonaByCustomerId,
}
