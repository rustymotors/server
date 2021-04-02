// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const pg = require('pg')

if (process.env.MCO_DB_PASS === undefined) {
  throw new Error('Please set the env: MCO_DB_PASS')
}

const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  password: process.env.MCO_DB_PASS,
  port: 5432
})

module.exports.pool = pool

/**
 * @param {string} text
 * @param {string[]} params
 * @return {Promise<pg.QueryResult<Record<string, string>[]>>}
 */
module.exports.query = function query (text, params) { return pool.query(text, params) }
