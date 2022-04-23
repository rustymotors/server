// @ts-check
// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import pg from "pg";
import { logger } from "mcos-shared/logger";
import { APP_CONFIG } from "mcos-shared/config";
const { Client } = pg;

const log = logger.child({ service: "mcoserver:DatabaseMgr" });

/**
 * This class abstracts database methods
 * @class
 */
export class DatabaseManager {
  /**
   *
   *
   * @private
   * @static
   * @type {DatabaseManager}
   * @memberof DatabaseManager
   */
  static _instance;

  /**
   * Return the instance of the DatabaseManager class
   * @returns {DatabaseManager}
   */
  static getInstance() {
    if (!DatabaseManager._instance) {
      DatabaseManager._instance = new DatabaseManager();
    }
    const self = DatabaseManager._instance;
    return self;
  }

  /**
   * Initialize database and set up schemas if needed
   * @returns {Promise<void>}
   */
  async init() {
    if (typeof this.localDB === "undefined") {
      log.debug("Initializing the database...");

      try {
        const self = DatabaseManager._instance;

        const db = new Client({
          connectionString: APP_CONFIG.MCOS.SETTINGS.DATABASE_CONNECTION_URI,
        });

        await db.connect();

        self.localDB = db;

        await db.query(`CREATE TABLE IF NOT EXISTS "sessions"
            (
              customer_id integer,
              sessionkey text NOT NULL,
              skey text NOT NULL,
              context_id text NOT NULL,
              connection_id text NOT NULL,
              CONSTRAINT pk_session PRIMARY KEY(customer_id)
            );`);

        await db.query(`CREATE TABLE IF NOT EXISTS "lobbies"
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
        log.debug("Database initialized");
      } catch (/** @type {unknown} */ err) {
        if (err instanceof Error) {
          const newError = new Error(
            `There was an error setting up the database: ${err.message}`
          );
          log.error(newError.message);
          throw newError;
        }
        throw err;
      }
    }
  }

  /**
   * Creates an instance of DatabaseManager.
   *
   * Please use {@link DatabaseManager.getInstance()} instead
   * @internal
   * @memberof DatabaseManager
   */
  constructor() {
    if (!APP_CONFIG.MCOS.SETTINGS.DATABASE_CONNECTION_URI) {
      throw new Error("Please set MCOS__SETTINGS__DATABASE_CONNECTION_URI");
    }
    this.connectionURI = APP_CONFIG.MCOS.SETTINGS.DATABASE_CONNECTION_URI;
    /** @type {pg.Client | undefined} */
    this.localDB = undefined;
  }

  /**
   * Locate customer session encryption key in the database
   * @param {number} customerId
   * @returns {Promise<import("mcos-shared/types").SessionRecord>}
   */
  async fetchSessionKeyByCustomerId(customerId) {
    await this.init();
    if (!this.localDB) {
      log.warn("Database not ready in fetchSessionKeyByCustomerId()");
      throw new Error("Error accessing database. Are you using the instance?");
    }
    const record = await this.localDB.query(
      "SELECT sessionkey, skey FROM sessions WHERE customer_id = $1",
      [customerId]
    );
    if (record === undefined) {
      log.debug("Unable to locate session key");
      throw new Error("Unable to fetch session key");
    }
    return record.rows[0];
  }

  /**
   * Locate customer session encryption key in the database
   * @param {number} connectionId
   * @returns {Promise<import("mcos-shared/types").SessionRecord>}
   */
  async fetchSessionKeyByConnectionId(connectionId) {
    await this.init();
    if (!this.localDB) {
      log.warn("Database not ready in fetchSessionKeyByConnectionId()");
      throw new Error("Error accessing database. Are you using the instance?");
    }
    const record = await this.localDB.query(
      "SELECT sessionkey, skey FROM sessions WHERE connection_id = $1",
      [connectionId]
    );
    if (record === undefined) {
      throw new Error("Unable to fetch session key");
    }
    return record.rows[0];
  }

  /**
   * Create or overwrite a customer's session key record
   * @param {number} customerId
   * @param {string} sessionkey
   * @param {string} contextId
   * @param {string} connectionId
   * @returns {Promise<number>}
   */
  async updateSessionKey(customerId, sessionkey, contextId, connectionId) {
    await this.init();
    const skey = sessionkey.slice(0, 16);

    if (!this.localDB) {
      log.warn("Database not ready in updateSessionKey()");
      throw new Error("Error accessing database. Are you using the instance?");
    }
    const record = await this.localDB.query(
      `INSERT INTO sessions (customer_id, sessionkey, skey, context_id, connection_id) 
        VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT (customer_id) 
        DO UPDATE SET sessionkey = $2, skey = $3;`,
      [customerId, sessionkey, skey, contextId, connectionId]
    );
    if (record === undefined) {
      throw new Error("Unable to fetch session key");
    }
    return 1;
  }
}
