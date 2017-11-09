var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(":memory:");

module.exports = {
    query: (text, params, callback) => {
        return pool.query(text, params, (err, res) => {
            callback(err, res)
        })
    }
}
