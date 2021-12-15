"use strict";
// @ts-check
// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.DatabaseManager = void 0;
var sqlite3 = require("sqlite3");
var sqlite_1 = require("sqlite");
var index_1 = require("../logger/index");
var appconfig_1 = require("../config/appconfig");
var log = index_1.logger.child({ service: "mcoserver:DatabaseMgr" });
var DatabaseManager = /** @class */ (function () {
    function DatabaseManager() {
        this.changes = 0;
        if (!appconfig_1["default"].MCOS.SETTINGS.DATABASE_CONNECTION_URI) {
            throw new Error("Please set MCOS__SETTINGS__DATABASE_CONNECTION_URI");
        }
        this.connectionURI = appconfig_1["default"].MCOS.SETTINGS.DATABASE_CONNECTION_URI;
    }
    DatabaseManager.getInstance = function () {
        if (!DatabaseManager._instance) {
            DatabaseManager._instance = new DatabaseManager();
        }
        var self = DatabaseManager._instance;
        return self;
    };
    DatabaseManager.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var self_1, db, err_1, newError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(typeof this.localDB === "undefined")) return [3 /*break*/, 6];
                        log.debug("Initializing the database...");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        self_1 = DatabaseManager._instance;
                        return [4 /*yield*/, (0, sqlite_1.open)({
                                filename: this.connectionURI,
                                driver: sqlite3.Database
                            })];
                    case 2:
                        db = _a.sent();
                        self_1.localDB = db;
                        self_1.changes = 0;
                        return [4 /*yield*/, db.run("CREATE TABLE IF NOT EXISTS \"sessions\"\n            (\n              customer_id integer,\n              sessionkey text NOT NULL,\n              skey text NOT NULL,\n              context_id text NOT NULL,\n              connection_id text NOT NULL,\n              CONSTRAINT pk_session PRIMARY KEY(customer_id)\n            );")];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, db.run("CREATE TABLE IF NOT EXISTS \"lobbies\"\n            (\n              \"lobyID\" integer NOT NULL,\n              \"raceTypeID\" integer NOT NULL,\n              \"turfID\" integer NOT NULL,\n              \"riffName\" character(32) NOT NULL,\n              \"eTerfName\" character(265) NOT NULL,\n              \"clientArt\" character(11) NOT NULL,\n              \"elementID\" integer NOT NULL,\n              \"terfLength\" integer NOT NULL,\n              \"startSlice\" integer NOT NULL,\n              \"endSlice\" integer NOT NULL,\n              \"dragStageLeft\" integer NOT NULL,\n              \"dragStageRight\" integer NOT NULL,\n              \"dragStagingSlice\" integer NOT NULL,\n              \"gridSpreadFactor\" real NOT NULL,\n              \"linear\" smallint NOT NULL,\n              \"numPlayersMin\" smallint NOT NULL,\n              \"numPlayersMax\" smallint NOT NULL,\n              \"numPlayersDefault\" smallint NOT NULL,\n              \"bnumPlayersEnable\" smallint NOT NULL,\n              \"numLapsMin\" smallint NOT NULL,\n              \"numLapsMax\" smallint NOT NULL,\n              \"numLapsDefault\" smallint NOT NULL,\n              \"bnumLapsEnabled\" smallint NOT NULL,\n              \"numRoundsMin\" smallint NOT NULL,\n              \"numRoundsMax\" smallint NOT NULL,\n              \"numRoundsDefault\" smallint NOT NULL,\n              \"bnumRoundsEnabled\" smallint NOT NULL,\n              \"bWeatherDefault\" smallint NOT NULL,\n              \"bWeatherEnabled\" smallint NOT NULL,\n              \"bNightDefault\" smallint NOT NULL,\n              \"bNightEnabled\" smallint NOT NULL,\n              \"bBackwardDefault\" smallint NOT NULL,\n              \"bBackwardEnabled\" smallint NOT NULL,\n              \"bTrafficDefault\" smallint NOT NULL,\n              \"bTrafficEnabled\" smallint NOT NULL,\n              \"bDamageDefault\" smallint NOT NULL,\n              \"bDamageEnabled\" smallint NOT NULL,\n              \"bAIDefault\" smallint NOT NULL,\n              \"bAIEnabled\" smallint NOT NULL,\n              \"topDog\" character(13) NOT NULL,\n              \"terfOwner\" character(33) NOT NULL,\n              \"qualifingTime\" integer NOT NULL,\n              \"clubNumPlayers\" integer NOT NULL,\n              \"clubNumLaps\" integer NOT NULL,\n              \"clubNumRounds\" integer NOT NULL,\n              \"bClubNight\" smallint NOT NULL,\n              \"bClubWeather\" smallint NOT NULL,\n              \"bClubBackwards\" smallint NOT NULL,\n              \"topSeedsMP\" integer NOT NULL,\n              \"lobbyDifficulty\" integer NOT NULL,\n              \"ttPointForQualify\" integer NOT NULL,\n              \"ttCashForQualify\" integer NOT NULL,\n              \"ttPointBonusFasterIncs\" integer NOT NULL,\n              \"ttCashBonusFasterIncs\" integer NOT NULL,\n              \"ttTimeIncrements\" integer NOT NULL,\n              \"victoryPoints1\" integer NOT NULL,\n              \"victoryCash1\" integer NOT NULL,\n              \"victoryPoints2\" integer NOT NULL,\n              \"victoryCash2\" integer NOT NULL,\n              \"victoryPoints3\" integer NOT NULL,\n              \"victoryCash3\" integer NOT NULL,\n              \"minLevel\" smallint NOT NULL,\n              \"minResetSlice\" integer NOT NULL,\n              \"maxResetSlice\" integer NOT NULL,\n              \"bnewbieFlag\" smallint NOT NULL,\n              \"bdriverHelmetFlag\" smallint NOT NULL,\n              \"clubNumPlayersMax\" smallint NOT NULL,\n              \"clubNumPlayersMin\" smallint NOT NULL,\n              \"clubNumPlayersDefault\" smallint NOT NULL,\n              \"numClubsMax\" smallint NOT NULL,\n              \"numClubsMin\" smallint NOT NULL,\n              \"racePointsFactor\" real NOT NULL,\n              \"bodyClassMax\" smallint NOT NULL,\n              \"powerClassMax\" smallint NOT NULL,\n              \"clubLogoID\" integer NOT NULL,\n              \"teamtWeather\" smallint NOT NULL,\n              \"teamtNight\" smallint NOT NULL,\n              \"teamtBackwards\" smallint NOT NULL,\n              \"teamtNumLaps\" smallint NOT NULL,\n              \"raceCashFactor\" real NOT NULL\n            );")];
                    case 4:
                        _a.sent();
                        log.debug("Database initialized");
                        return [3 /*break*/, 6];
                    case 5:
                        err_1 = _a.sent();
                        if (err_1 instanceof Error) {
                            newError = new Error("There was an error setting up the database: ".concat(err_1.message));
                            log.error(newError.message);
                            throw newError;
                        }
                        throw err_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseManager.prototype.fetchSessionKeyByCustomerId = function (customerId) {
        return __awaiter(this, void 0, void 0, function () {
            var stmt, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        if (!this.localDB) {
                            log.warn("Database not ready in fetchSessionKeyByCustomerId()");
                            throw new Error("Error accessing database. Are you using the instance?");
                        }
                        return [4 /*yield*/, this.localDB.prepare("SELECT sessionkey, skey FROM sessions WHERE customer_id = ?")];
                    case 2:
                        stmt = _a.sent();
                        return [4 /*yield*/, stmt.get(customerId)];
                    case 3:
                        record = _a.sent();
                        if (record === undefined) {
                            log.debug("Unable to locate session key");
                            throw new Error("Unable to fetch session key");
                        }
                        return [2 /*return*/, record];
                }
            });
        });
    };
    DatabaseManager.prototype.fetchSessionKeyByConnectionId = function (connectionId) {
        return __awaiter(this, void 0, void 0, function () {
            var stmt, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        if (!this.localDB) {
                            log.warn("Database not ready in fetchSessionKeyByConnectionId()");
                            throw new Error("Error accessing database. Are you using the instance?");
                        }
                        return [4 /*yield*/, this.localDB.prepare("SELECT sessionkey, skey FROM sessions WHERE connection_id = ?")];
                    case 2:
                        stmt = _a.sent();
                        return [4 /*yield*/, stmt.get(connectionId)];
                    case 3:
                        record = _a.sent();
                        if (record === undefined) {
                            throw new Error("Unable to fetch session key");
                        }
                        return [2 /*return*/, record];
                }
            });
        });
    };
    DatabaseManager.prototype.updateSessionKey = function (customerId, sessionkey, contextId, connectionId) {
        return __awaiter(this, void 0, void 0, function () {
            var skey, stmt, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        skey = sessionkey.slice(0, 16);
                        if (!this.localDB) {
                            log.warn("Database not ready in updateSessionKey()");
                            throw new Error("Error accessing database. Are you using the instance?");
                        }
                        return [4 /*yield*/, this.localDB.prepare("REPLACE INTO sessions (customer_id, sessionkey, skey, context_id, connection_id) VALUES ($customerId, $sessionkey, $skey, $contextId, $connectionId)")];
                    case 2:
                        stmt = _a.sent();
                        return [4 /*yield*/, stmt.run({
                                $customerId: customerId,
                                $sessionkey: sessionkey,
                                $skey: skey,
                                $contextId: contextId,
                                $connectionId: connectionId
                            })];
                    case 3:
                        record = _a.sent();
                        if (record === undefined) {
                            throw new Error("Unable to fetch session key");
                        }
                        return [2 /*return*/, 1];
                }
            });
        });
    };
    return DatabaseManager;
}());
exports.DatabaseManager = DatabaseManager;
