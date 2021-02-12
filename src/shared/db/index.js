const pg = require('pg')

const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  password: 'password',
  port: 5432
})

/**
 * @param {string} text
 * @param {any[]} params
 * @return {Promise<pg.QueryResult<any>>}
 */
exports.query = (text, params) => pool.query(text, params)
exports.pool = pool
