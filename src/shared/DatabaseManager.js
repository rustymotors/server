// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const sqlite3 = require('sqlite3').verbose();

/**
 * Database connection abstraction
 * @module DatabaseManager
 */

/**
 * @class
 */
module.exports.DatabaseManager = class DatabaseManager {

  constructor() {
    const db = new sqlite3.Database('db/mco.db');
    this.db = db

    this.db.serialize(function () {
      db.run(`CREATE TABLE IF NOT EXISTS "sessions"
        (
          customer_id integer,
          sessionkey text NOT NULL,
          skey text NOT NULL,
          context_id text NOT NULL,
          connection_id text NOT NULL,
          CONSTRAINT pk_session PRIMARY KEY(customer_id)
        );`);

      db.run(`CREATE TABLE IF NOT EXISTS "lobbies"
        (
          "lobyID" integer NOT NULL,
          "raceTypeID" integer NOT NULL,
          "turfID" integer NOT NULL,
          "riffName" character(32) NOT NULL,
          "eTerfName" character(265) NOT NULL,
          "clientArt" character(11) NOT NULL,
          "elementID" integer NOT NULL,
          "terfLength" integer NOT NULL,
          "startSlice" integer NOT NULL,
          "endSlice" integer NOT NULL,
          "dragStageLeft" integer NOT NULL,
          "dragStageRight" integer NOT NULL,
          "dragStagingSlice" integer NOT NULL,
          "gridSpreadFactor" real NOT NULL,
          "linear" smallint NOT NULL,
          "numPlayersMin" smallint NOT NULL,
          "numPlayersMax" smallint NOT NULL,
          "numPlayersDefault" smallint NOT NULL,
          "bnumPlayersEnable" smallint NOT NULL,
          "numLapsMin" smallint NOT NULL,
          "numLapsMax" smallint NOT NULL,
          "numLapsDefault" smallint NOT NULL,
          "bnumLapsEnabled" smallint NOT NULL,
          "numRoundsMin" smallint NOT NULL,
          "numRoundsMax" smallint NOT NULL,
          "numRoundsDefault" smallint NOT NULL,
          "bnumRoundsEnabled" smallint NOT NULL,
          "bWeatherDefault" smallint NOT NULL,
          "bWeatherEnabled" smallint NOT NULL,
          "bNightDefault" smallint NOT NULL,
          "bNightEnabled" smallint NOT NULL,
          "bBackwardDefault" smallint NOT NULL,
          "bBackwardEnabled" smallint NOT NULL,
          "bTrafficDefault" smallint NOT NULL,
          "bTrafficEnabled" smallint NOT NULL,
          "bDamageDefault" smallint NOT NULL,
          "bDamageEnabled" smallint NOT NULL,
          "bAIDefault" smallint NOT NULL,
          "bAIEnabled" smallint NOT NULL,
          "topDog" character(13) NOT NULL,
          "terfOwner" character(33) NOT NULL,
          "qualifingTime" integer NOT NULL,
          "clubNumPlayers" integer NOT NULL,
          "clubNumLaps" integer NOT NULL,
          "clubNumRounds" integer NOT NULL,
          "bClubNight" smallint NOT NULL,
          "bClubWeather" smallint NOT NULL,
          "bClubBackwards" smallint NOT NULL,
          "topSeedsMP" integer NOT NULL,
          "lobbyDifficulty" integer NOT NULL,
          "ttPointForQualify" integer NOT NULL,
          "ttCashForQualify" integer NOT NULL,
          "ttPointBonusFasterIncs" integer NOT NULL,
          "ttCashBonusFasterIncs" integer NOT NULL,
          "ttTimeIncrements" integer NOT NULL,
          "victoryPoints1" integer NOT NULL,
          "victoryCash1" integer NOT NULL,
          "victoryPoints2" integer NOT NULL,
          "victoryCash2" integer NOT NULL,
          "victoryPoints3" integer NOT NULL,
          "victoryCash3" integer NOT NULL,
          "minLevel" smallint NOT NULL,
          "minResetSlice" integer NOT NULL,
          "maxResetSlice" integer NOT NULL,
          "bnewbieFlag" smallint NOT NULL,
          "bdriverHelmetFlag" smallint NOT NULL,
          "clubNumPlayersMax" smallint NOT NULL,
          "clubNumPlayersMin" smallint NOT NULL,
          "clubNumPlayersDefault" smallint NOT NULL,
          "numClubsMax" smallint NOT NULL,
          "numClubsMin" smallint NOT NULL,
          "racePointsFactor" real NOT NULL,
          "bodyClassMax" smallint NOT NULL,
          "powerClassMax" smallint NOT NULL,
          "clubLogoID" integer NOT NULL,
          "teamtWeather" smallint NOT NULL,
          "teamtNight" smallint NOT NULL,
          "teamtBackwards" smallint NOT NULL,
          "teamtNumLaps" smallint NOT NULL,
          "raceCashFactor" real NOT NULL
        );`);
    });
    this.serviceName = 'mcoserver:DatabaseMgr'
  }

  db() {
    return this.db
  }

  /**
   *
   * @param {number} customerId
   * @return {Promise<ISessionRecord>}
   * @memberof {DatabaseManager}
   */
  async fetchSessionKeyByCustomerId(customerId) {
    try {
      const stmt = this.db.prepare("SELECT sessionkey, skey FROM sessions WHERE customer_id = ?");
      const row = stmt.get(customerId)
      stmt.finalize()
      /** @type {SessionRecord} */
      return row
    } catch (e) {
      throw new Error(`Unable to fetch session key: ${e}`)
    }
  }

  /**
   * Fetch session key from database based on remote address
   *
   * @param {string} connectionId
   * @return {Promise<ISessionRecord>}
   * @memberof {DatabaseManager}
   */
  async fetchSessionKeyByConnectionId(connectionId) {
    try {
      const stmt = this.db.prepare("SELECT sessionkey, skey FROM sessions WHERE connection_id = ?");
      const row = stmt.get(connectionId)
      stmt.finalize()

      /** @type {ISession_Record} */
      return row
    } catch (e) {
      process.exitCode = -1
      throw new Error(`Unable to fetch session key ', ${e}`)
    }
  }

  /**
   *
   * @param {number} customerId
   * @param {string} sessionkey
   * @param {string} contextId
   * @param {string} connectionId
   * @return {Promise<ISessionRecord>}
   * @memberof {DatabaseManager}
   */
  async _updateSessionKey(customerId, sessionkey, contextId, connectionId) {
    const skey = sessionkey.substr(0, 16)
    try {
      const stmt = this.db.prepare("INSERT INTO sessions (customer_id, sessionkey, skey, context_id, connection_id) VALUES (?, ?, ?, ?, ?)");
      const row = stmt.run(customerId, sessionkey, skey, contextId, connectionId)
      stmt.finalize()

      /** @type {ISessionRecord} */
      return row
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`Unable to update session key: ${e.message}`)
      }
      throw new Error('Unable to update session key, error unknown')
    }
  }
}
