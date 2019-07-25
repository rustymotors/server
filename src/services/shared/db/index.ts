const { Pool } = require("pg");

const pool = new Pool();

module.exports = {
  query: (text: string, params: string[]) => pool.query(text, params),
};
