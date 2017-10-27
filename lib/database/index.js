const { Pool } = require('pg')

const connectionString = 'postgresql://postgres@localhost:5432/mco'

const pool = new Pool({
    connectionString: connectionString
})

module.exports = {
    query: (text, params, callback) => {
        return pool.query(text, params, (err, res) => {
            callback(err, res)
        })
    }
}
