// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { Sequelize, DataTypes } = require('sequelize')

if (process.env.MCO_DB_CONNECTION === undefined) {
  throw new Error('Please set the env: MCO_DB_CONNECTION')
}

const sequelize = new Sequelize(process.env.MCO_DB_CONNECTION)

module.exports.Session = sequelize.define('Session', {
  // Model attributes are defined here
  customer_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true
  },
  sessionkey: {
    type: DataTypes.STRING,
    allowNull: false
  },
  skey: {
    type: DataTypes.STRING,
    allowNull: false
  },
  context_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  connection_id: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {})
