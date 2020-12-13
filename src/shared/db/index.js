const { Pool } = require('pg')

const pool = new Pool()

const query = (text, params) => pool.query(text, params)

module.exports = {
  query
}
