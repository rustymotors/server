// @ts-check
// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const { pino: P } = require("pino");
const { createServer } = require("http");
const { RoutingMesh } = require("../../router/src/index.js");
const process = require("process");
const { EServerConnectionService } = require("../../router/src/types.js");

const log = P().child({ service: "mcos:DatabaseMgr" });
log.level = process.env["LOG_LEVEL"] || "info";

/**
 * @exports
 * @typedef {Object} SessionRecord
 * @property {string} skey
 * @property {string} sessionkey
 */

class DatabaseManager {
  /**
   * @private
   * @type {DatabaseManager}
   */
  static _instance;
  /**
   * @private
   * @type {import("../../config/src/index").AppConfiguration}
   */
  _config;
  /**
   * @private
   * @type {import("http").Server}
   */
  _server;
  /**
   * @private
   * @type {import("sqlite").Database | undefined}
   */
  _localDB;

  async closeDB() {
    if (typeof this._localDB === "undefined") {
      throw new Error("Tried to close the database, but it was not open!");
    }

    this._localDB.close();
  }

  /**
   * @return {DatabaseManager}
   */
  static getInstance() {
    if (typeof DatabaseManager._instance === "undefined") {
      DatabaseManager._instance = new DatabaseManager();
    }
    return DatabaseManager._instance;
  }

  /**
   *
   * @param {import("../../config/src/index.js").AppConfiguration} config
   */
  async init(config) {
    if (typeof config === "undefined") {
      throw new Error(
        "Please remember to pass a valid config to the Database manager"
      );
    }
    this._config = config;

    log.debug("Connecting to database");
    try {
      const db = await open({
        filename: config.serviceConnections.databaseURL,
        driver: sqlite3.Database,
      });
      this._localDB = db;

      log.debug("Populating tables");
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
      log.debug("Database initialized");
      return DatabaseManager._instance;
    } catch (err) {
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

  /**
   * @private
   * */
  constructor() {
    this._server = createServer((request, response) => {
      this.handleRequest(request, response);
    });

    this._server.on("error", (error) => {
      process.exitCode = -1;
      log.error(`Server error: ${error.message}`);
      log.info(`Server shutdown: ${process.exitCode}`);
      throw new Error("Database server quit unexpectedly");
    });
  }

  /**
   *
   * @param {import("http").IncomingMessage} request
   * @param {import("http").ServerResponse} response
   */
  handleRequest(request, response) {
    const header = {
      type: "Content-Type",
      value: "application/json",
    };

    switch (request.url) {
      case "/":
        response.setHeader(header.type, header.value);
        response.end(
          JSON.stringify({
            status: 200,
            message: "Hello",
          })
        );
        break;

      default:
        response.statusCode = 404;
        response.end("");
        break;
    }
  }

  /**
   *
   * @param {number} customerId
   * @returns {Promise<SessionRecord>}
   */
  async fetchSessionKeyByCustomerId(customerId) {
    if (typeof this._localDB === "undefined") {
      throw new Error("Error accessing database. Did you initialize it?");
    }
    const stmt = await this._localDB.prepare(
      "SELECT sessionkey, skey FROM sessions WHERE customer_id = ?"
    );

    /** @type {SessionRecord} */
    const record = await stmt.get(customerId);
    if (record === undefined) {
      throw new Error("Unable to fetch session key");
    }
    return record;
  }

  /**
   *
   * @param {string} connectionId
   * @returns {Promise<SessionRecord>}
   */
  async fetchSessionKeyByConnectionId(connectionId) {
    if (typeof this._localDB === "undefined") {
      throw new Error("Error accessing database. Did you initialize it?");
    }
    const stmt = await this._localDB.prepare(
      "SELECT sessionkey, skey FROM sessions WHERE connection_id = ?"
    );
    /** @type {SessionRecord} */
    const record = await stmt.get(connectionId);
    if (record === undefined) {
      throw new Error("Unable to fetch session key");
    }
    return record;
  }

  /**
   *
   * @param {number} customerId
   * @param {string} sessionkey
   * @param {string} contextId
   * @param {string} connectionId
   * @returns {Promise<number>}
   */
  async _updateSessionKey(customerId, sessionkey, contextId, connectionId) {
    if (typeof this._localDB === "undefined") {
      throw new Error("Error accessing database. Did you initialize it?");
    }
    const skey = sessionkey.slice(0, 16);

    const stmt = await this._localDB.prepare(
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

  /**
   *
   * @returns {import("http").Server}
   */
  start() {
    const host = this._config.serverSettings.ipServer || "localhost";
    const port = 0;
    log.debug(`Attempting to bind to port ${port}`);
    return this._server.listen({ port, host }, () => {
      log.debug(`port ${port} listening`);
      log.info("Patch server is listening...");

      // Register service with router
      RoutingMesh.getInstance().registerServiceWithRouter(
        EServerConnectionService.DATABASE,
        host,
        port
      );
    });
  }
}
module.exports = { DatabaseManager };
