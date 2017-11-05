const { Pool } = require("pg");

const dbPassword = process.env.DB_PASSWORD

const connectionString = `postgresql://postgres@localhost:5432/mco`;

const pool = new Pool({
  connectionString,
});

module.exports = {
  query: (text, params, callback) => {
    const start = Date.now();
    return pool.query(text, params, (err, res) => {
      const duration = Date.now() - start;
      console.log("executed query", {
        text,
        duration,
        rows: res.rowCount,
      });
      callback(err, res);
    });
  },
};
