const { Pool } = require('pg')

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  password: 'password',
  port: 5432
})

/**
 * @param {string} text
 * @param {any[]} params
 */
exports.query = (text, params) => pool.query(text, params)
exports.pool = pool
