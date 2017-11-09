const { Pool } = require("pg");

const dbPassword = process.env.DB_PASSWORD

const connectionString = `postgresql://postgres@localhost:5432/mco`;

const pool = new Pool({
  connectionString,
});

module.exports = {
    query: (text, params, callback) => {
        return pool.query(text, params, (err, res) => {
            callback(err, res)
        })
    }
}

