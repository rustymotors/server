// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import pg, { QueryArrayConfig } from 'pg'

export const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  password: 'password',
  port: 5432
})

/**
 * @param {string} text
 * @param {string[]} params
 * @return {Promise<pg.QueryResult<any>>}
 */
export function query (text: QueryArrayConfig, params: string[]): Promise<pg.QueryResult<Record<string, unknown>[]>> { return pool.query(text, params) }
