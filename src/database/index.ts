// @ts-check
// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as sqlite3 from "sqlite3";
import { Database, open } from "sqlite";
import type { SessionRecord } from "../types/index";
import { logger } from "../logger/index";
import { APP_CONFIG } from "../config/appconfig";

const log = logger.child({ service: "mcoserver:DatabaseMgr" });

/**
 * This class abstracts database methods
 * @class
 */
export class DatabaseManager {
  private static _instance: DatabaseManager;
  private connectionURI: string;
  changes = 0;
  localDB: Database | undefined;

  /**
   * Return the instance of the DatabaseManager class
   * @returns {DatabaseManager}
   */
  public static getInstance(): DatabaseManager {
    if (!DatabaseManager._instance) {
      DatabaseManager._instance = new DatabaseManager();
    }
    const self = DatabaseManager._instance;
    return self;
  }

  /**
   * Initialize database and set up schemas if needed
   * @returns {Promise<void}
   */
  async init(): Promise<void> {
    if (typeof this.localDB === "undefined") {
      log.debug(`Initializing the database...`);

      try {
        const self = DatabaseManager._instance;

        const db = await open({
          filename: this.connectionURI,
          driver: sqlite3.Database,
        });

        self.localDB = db;

        self.changes = 0;

        await db.run(`CREATE TABLE IF NOT EXISTS "sessions"
            (
              customer_id integer,
              sessionkey text NOT NULL,
              skey text NOT NULL,
              context_id text NOT NULL,
              connection_id text NOT NULL,
              CONSTRAINT pk_session PRIMARY KEY(customer_id)
            );`);

        await db.run(`CREATE TABLE IF NOT EXISTS "lobbies"
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
        log.debug(`Database initialized`);
      } catch (err: unknown) {
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

  private constructor() {
    if (!APP_CONFIG.MCOS.SETTINGS.DATABASE_CONNECTION_URI) {
      throw new Error("Please set MCOS__SETTINGS__DATABASE_CONNECTION_URI");
    }
    this.connectionURI = APP_CONFIG.MCOS.SETTINGS.DATABASE_CONNECTION_URI;
  }

  /**
   * Locate customer session encryption key in the database
   * @param {number} customerId
   * @returns {SessionRecord}
   */
  async fetchSessionKeyByCustomerId(
    customerId: number
  ): Promise<SessionRecord> {
    await this.init();
    if (!this.localDB) {
      log.warn("Database not ready in fetchSessionKeyByCustomerId()");
      throw new Error("Error accessing database. Are you using the instance?");
    }
    const stmt = await this.localDB.prepare(
      "SELECT sessionkey, skey FROM sessions WHERE customer_id = ?"
    );

    const record = await stmt.get(customerId);
    if (record === undefined) {
      log.debug("Unable to locate session key");
      throw new Error("Unable to fetch session key");
    }
    return record as SessionRecord;
  }

  /**
   * Locate customer session encryption key in the database
   * @param {number} customerId
   * @returns {SessionRecord}
   */
  async fetchSessionKeyByConnectionId(
    connectionId: string
  ): Promise<SessionRecord> {
    await this.init();
    if (!this.localDB) {
      log.warn("Database not ready in fetchSessionKeyByConnectionId()");
      throw new Error("Error accessing database. Are you using the instance?");
    }
    const stmt = await this.localDB.prepare(
      "SELECT sessionkey, skey FROM sessions WHERE connection_id = ?"
    );
    const record = await stmt.get(connectionId);
    if (record === undefined) {
      throw new Error("Unable to fetch session key");
    }
    return record as SessionRecord;
  }

  /**
   * Create or overwrite a customer's session key record
   * @param {number} customerId
   * @param {string} sessionkey
   * @param {string} contextId
   * @param {string} connectionId
   * @returns {Promise<number}
   */
  async updateSessionKey(
    customerId: number,
    sessionkey: string,
    contextId: string,
    connectionId: string
  ): Promise<number> {
    await this.init();
    const skey = sessionkey.slice(0, 16);

    if (!this.localDB) {
      log.warn("Database not ready in updateSessionKey()");
      throw new Error("Error accessing database. Are you using the instance?");
    }
    const stmt = await this.localDB.prepare(
      "REPLACE INTO sessions (customer_id, sessionkey, skey, context_id, connection_id) VALUES ($customerId, $sessionkey, $skey, $contextId, $connectionId)"
    );
    const record = await stmt.run({
      $customerId: customerId,
      $sessionkey: sessionkey,
      $skey: skey,
      $contextId: contextId,
      $connectionId: connectionId,
    });
    if (record === undefined) {
      throw new Error("Unable to fetch session key");
    }
    return 1;
  }
}
