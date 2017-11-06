const { Pool } = require("pg");


const connectionStringPri = `postgresql://postgres:postgres@postgres`;

const connectionString = `postgresql://postgres:postgres@postgres/mco`;

const pool2 = new Pool({
  connectionStringPri,
});

const pool = new Pool({
  connectionString,
});

pool2.query('CREATE DATABASE mco', (err, res) => {
	  console.log(err, res)
	  pool2.end()
})

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
  create: (text, params, callback) => {
    const start = Date.now();
    return pool2.query(text, params, (err, res) => {
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
