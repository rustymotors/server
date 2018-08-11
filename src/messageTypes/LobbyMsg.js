// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

const { logger } = require('../logger');

class LobbyInfo {
  constructor(lobbyJson) {
    // DWORD    lobbyID;
    this.lobbyId = lobbyJson.lobbyId || 0;
    // DWORD    raceTypeID;
    this.racetypeId = lobbyJson.racetypeId || 0;
    // DWORD    turfID;
    this.turfId = lobbyJson.turfId || 0;

    // char NPSRiffName[MC_MAX_NPS_RIFF_NAME]; // 32
    this.NPSRiffName = lobbyJson.NPSRiffName || 'main';
    // char eTurfName[256];
    this.eTurfName = lobbyJson.eTurfName || '';
    // char clientArt[11];
    this.clientArt = lobbyJson.clientArt || '';
    // DWORD    elementID;
    this.elementId = lobbyJson.elementId || 0;
    // DWORD    turfLength;
    this.turfLength = lobbyJson.turfLength || 0;
    // DWORD    startSlice;
    this.startSlice = lobbyJson.startSlice || 0;
    // DWORD    endSlice;
    this.endSlice = lobbyJson.endSlice || 0;
    // float    dragStageLeft;
    this.dragStageLeft = lobbyJson.dragStageLeft || 0;
    // float    dragStageRight;
    this.dragStageRight = lobbyJson.dragStageRight || 0;
    // DWORD    dragStagingSlice;
    this.dragStagingSlice = lobbyJson.dragStagingSlice || 0;
    // float    gridSpreadFactor;
    this.gridSpreadFactor = lobbyJson.gridSpreadFactor || 0;
    // WORD    linear;
    this.linear = lobbyJson.linear || 0;
    // WORD    numplayersmin;
    this.numplayersmin = lobbyJson.numplayersmin || 0;
    // WORD    numplayersmax;
    this.numplayersmax = lobbyJson.numplayersmax || 5;
    // WORD    numplayersdefault;
    this.numplayersdefault = lobbyJson.numplayersdefault || 1;
    // WORD    bnumplayersenabled;
    this.bnumplayersenabled = lobbyJson.bnumplayersenabled || 0;
    // WORD    numlapsmin;
    this.numlapsmin = lobbyJson.numlapsmin || 1;
    // WORD    numlapsmax;
    this.numlapsmax = lobbyJson.numlapsmax || 5;
    // WORD    numlapsdefault;
    this.numlapsdefault = lobbyJson.numlapsdefault || 1;
    // WORD    bnumlapsenabled;
    this.bnumlapsenabled = lobbyJson.bnumlapsenabled || 0;
    // WORD    numroundsmin;
    this.numroundsmin = lobbyJson.numroundsmin || 1;
    // WORD    numroundsmax;
    this.numroundsmax = lobbyJson.numroundsmax || 5;
    // WORD    numroundsdefault;
    this.numroundsdefault = lobbyJson.numroundsdefault || 1;
    // WORD    bnumroundsenabled;
    this.bnumroundsenabled = lobbyJson.bnumroundsenabled || 0;
    // WORD    bweatherdefault;
    this.bweatherdefault = lobbyJson.bweatherdefault || 0;
    // WORD    bweatherenabled;
    this.bweatherenabled = lobbyJson.bweatherenabled || 0;
    // WORD    bnightdefault;
    this.bnightdefault = lobbyJson.bnightdefault || 0;
    // WORD    bnightenabled;
    this.bnightenabled = lobbyJson.bnightenabled || 0;
    // WORD    bbackwarddefault;
    this.bbackwarddefault = lobbyJson.bbackwarddefault || 0;
    // WORD    bbackwardenabled;
    this.bbackwardenabled = lobbyJson.bbackwardenabled || 0;
    // WORD    btrafficdefault;
    this.btrafficdefault = lobbyJson.btrafficdefault || 0;
    // WORD    btrafficenabled;
    this.btrafficenabled = lobbyJson.btrafficenabled || 0;
    // WORD    bdamagedefault;
    this.bdamagedefault = lobbyJson.bdamagedefault || 0;
    // WORD    bdamageenabled;
    this.bdamageenabled = lobbyJson.bdamageenabled || 0;
    // WORD    baidefault;
    this.baidefault = lobbyJson.baidefault || 0;
    // WORD    baienabled;
    this.baienabled = lobbyJson.baienabled || 0;

    // char   topDog[MC_NAME_LENGTH]; = 13
    // Also used for TimeTrial's "Last Weeks Champion"?
    this.topDog = lobbyJson.topDog || '';
    // char   turfOwner[MAX_CLUB_NAME_LENGTH+1]; = 33 (including the +1)
    this.turfOwner = lobbyJson.turfOwner || '';
    // DWORD  qualifyingTime;
    this.qualifyingTime = lobbyJson.qualifyingTime || 0;
    // DWORD   clubNumPlayers;
    this.clubNumPlayers = lobbyJson.clubNumPlayers || 1;
    // DWORD   clubNumLaps;
    this.clubNumLaps = lobbyJson.clubNumLaps || 1;
    // DWORD   clubNumRounds;
    this.clubNumRounds = lobbyJson.clubNumRounds || 1;
    // WORD    clubNight;
    this.clubNight = lobbyJson.clubNight || 0;
    // WORD    clubWeather;
    this.clubWeather = lobbyJson.clubWeather || 0;
    // WORD    clubBackwards;
    this.clubBackwards = lobbyJson.clubBackwards || 0;
    // DWORD  bestLapTime; // (64hz ticks)
    this.bestLapTime = lobbyJson.bestLapTime || 0;
    // DWORD  lobbyDifficulty;
    this.lobbyDifficulty = lobbyJson.lobbyDifficulty || 0;
    // DWORD  ttPointForQualify;
    this.ttPointForQualify = lobbyJson.ttPointForQualify || 0;
    // DWORD  ttCashForQualify;
    this.ttCashForQualify = lobbyJson.ttCashForQualify || 0;
    // DWORD  ttPointBonusFasterIncs;
    this.ttPointBonusFasterIncs = lobbyJson.ttPointBonusFasterIncs || 1;
    // DWORD  ttCashBonusFasterIncs;
    this.ttCashBonusFasterIncs = lobbyJson.ttCashBonusFasterIncs || 1;
    // DWORD  ttTimeIncrements;
    this.ttTimeIncrements = lobbyJson.ttTimeIncrements || 1;
    // DWORD  ttvictory_1st_points;
    this.ttvictory_1st_points = lobbyJson.ttvictory_1st_points || 1;
    // DWORD  ttvictory_1st_cash;
    this.ttvictory_1st_cash = lobbyJson.ttvictory_1st_cash || 1;
    // DWORD  ttvictory_2nd_points;
    this.ttvictory_2nd_points = lobbyJson.ttvictory_2nd_points || 2;
    // DWORD  ttvictory_2nd_cash;
    this.ttvictory_2nd_cash = lobbyJson.ttvictory_2nd_cash || 2;
    // DWORD  ttvictory_3rd_points;
    this.ttvictory_3rd_points = lobbyJson.ttvictory_3rd_points || 3;
    // DWORD  ttvictory_3rd_cash;
    this.ttvictory_3rd_cash = lobbyJson.ttvictory_3rd_cash || 3;
    // WORD   minLevel;
    this.minLevel = lobbyJson.minLevel || 0;
    // DWORD  minResetSlice;
    this.minResetSlice = lobbyJson.minResetSlice || 0;
    // DWORD  maxResetSlice;
    this.maxResetSlice = lobbyJson.maxResetSlice || 1;
    // WORD   newbieFlag;
    this.newbieFlag = lobbyJson.newbieFlag || 1;
    // WORD   driverHelmetFlag;
    this.driverHelmetFlag = lobbyJson.driverHelmetFlag || 0;
    // WORD   clubNumPlayersMax;
    this.clubNumPlayersMax = lobbyJson.clubNumPlayersMax || 1;
    // WORD   clubNumPlayersMin;
    this.clubNumPlayersMin = lobbyJson.clubNumPlayersMin || 0;
    // WORD   clubNumPlayersDefault;
    this.clubNumPlayersDefault = lobbyJson.clubNumPlayersDefault || 0;
    // WORD   numClubsMin;
    this.numClubsMin = lobbyJson.numClubsMin || 0;
    // float  racePointsFactor;
    this.racePointsFactor = lobbyJson.racePointsFactor || 1;
    // WORD   bodyClassMax;
    this.bodyClassMax = lobbyJson.bodyClassMax || 10;
    // WORD   powerClassMax;
    this.powerClassMax = lobbyJson.powerClassMax || 10;
    // WORD   partPrizesMax;      // max allowed for this lobby
    this.partPrizesMax = lobbyJson.partPrizesMax || 1;
    // WORD   partPrizesWon;      // current users prizes for this lobby
    this.partPrizesWon = lobbyJson.partPrizesMax || 1;
    // DWORD  clubLogoID;         // Logo ID for Turf owner
    this.clubLogoId = lobbyJson.clubLogoId || 0;
    // WORD   bteamtrialweather;  // Team Trials Weather Flag
    this.bteamtrialweather = lobbyJson.bteamtrialweather || 0;
    // WORD   bteamtrialnight;    // Team Trials Night Flag
    this.bteamtrialnight = lobbyJson.bteamtrialnight || 0;
    // WORD   bteamtrialbackward; // Team Trials Backwards Flag
    this.bteamtrialbackward = lobbyJson.bteamtrialbackward || 0;
    // WORD   teamtrialnumlaps;   // Team Trials Number of Laps
    this.teamtrialnumlaps = lobbyJson.teamtrialnumlaps || 0;
    // DWORD  teamtrialbaseTUP;   // Team Trials Base Time Under Par
    this.teamtrialbaseTUP = lobbyJson.teamtrialbaseTUP || 0;
    // float  raceCashFactor;
    this.raceCashFactor = lobbyJson.raceCashFactor || 1;
  }

  toPacket() {
    const lobbyPacket = Buffer.alloc(567);

    lobbyPacket.writeInt32LE(this.lobbyId, 0);
    lobbyPacket.writeInt32LE(this.racetypeId, 4);
    lobbyPacket.writeInt32LE(this.turfId, 8);

    lobbyPacket.write(this.NPSRiffName, 12, 32);
    // char eTurfName[256];
    lobbyPacket.write(this.eTurfName, 44, 256);
    // char clientArt[11];
    lobbyPacket.write(this.clientArt, 300, 11);
    // DWORD    elementID;
    lobbyPacket.writeInt32LE(this.elementId, 311);
    // DWORD    turfLength;
    lobbyPacket.writeInt32LE(this.turfLength, 315);
    // DWORD    startSlice;
    lobbyPacket.writeInt32LE(this.startSlice, 319);
    // DWORD    endSlice;
    lobbyPacket.writeInt32LE(this.endSlice, 323);
    // float    dragStageLeft;
    lobbyPacket.writeInt32LE(this.dragStageLeft, 327);
    // float    dragStageRight;
    lobbyPacket.writeInt32LE(this.dragStageRight, 331);
    // DWORD    dragStagingSlice;
    lobbyPacket.writeInt32LE(this.dragStagingSlice, 335);
    // float    gridSpreadFactor;
    lobbyPacket.writeInt32LE(this.gridSpreadFactor, 339);
    // WORD    linear;
    lobbyPacket.writeInt16LE(this.linear, 341);
    // WORD    numplayersmin;
    lobbyPacket.writeInt16LE(this.numplayersmin, 343);
    // WORD    numplayersmax;
    lobbyPacket.writeInt16LE(this.numplayersmax, 345);
    // WORD    numplayersdefault;
    lobbyPacket.writeInt16LE(this.numplayersdefault, 347);
    // WORD    bnumplayersenabled;
    lobbyPacket.writeInt16LE(this.bnumplayersenabled, 349);
    // WORD    numlapsmin;
    lobbyPacket.writeInt16LE(this.numlapsmin, 351);
    // WORD    numlapsmax;
    lobbyPacket.writeInt16LE(this.numlapsmax, 353);
    // WORD    numlapsdefault;
    lobbyPacket.writeInt16LE(this.numlapsdefault, 355);
    // WORD    bnumlapsenabled;
    lobbyPacket.writeInt16LE(this.bnumlapsenabled, 357);
    // WORD    numroundsmin;
    lobbyPacket.writeInt16LE(this.numroundsmin, 359);
    // WORD    numroundsmax;
    lobbyPacket.writeInt16LE(this.numroundsmax, 361);
    // WORD    numroundsdefault;
    lobbyPacket.writeInt16LE(this.numroundsdefault, 363);
    // WORD    bnumroundsenabled;
    lobbyPacket.writeInt16LE(this.bnumroundsenabled, 365);
    // WORD    bweatherdefault;
    lobbyPacket.writeInt16LE(this.bweatherdefault, 367);
    // WORD    bweatherenabled;
    lobbyPacket.writeInt16LE(this.bweatherenabled, 367);
    // WORD    bnightdefault;
    lobbyPacket.writeInt16LE(this.bnightdefault, 369);
    // WORD    bnightenabled;
    lobbyPacket.writeInt16LE(this.bnightenabled, 371);
    // WORD    bbackwarddefault;
    lobbyPacket.writeInt16LE(this.bbackwarddefault, 373);
    // WORD    bbackwardenabled;
    lobbyPacket.writeInt16LE(this.bbackwardenabled, 375);
    // WORD    btrafficdefault;
    lobbyPacket.writeInt16LE(this.btrafficdefault, 379);
    // WORD    btrafficenabled;
    lobbyPacket.writeInt16LE(this.btrafficenabled, 381);
    // WORD    bdamagedefault;
    lobbyPacket.writeInt16LE(this.bdamagedefault, 383);
    // WORD    bdamageenabled;
    lobbyPacket.writeInt16LE(this.bdamageenabled, 385);
    // WORD    baidefault;
    lobbyPacket.writeInt16LE(this.baidefault, 387);
    // WORD    baienabled;
    lobbyPacket.writeInt16LE(this.baienabled, 389);

    // char   topDog[MC_NAME_LENGTH]; = 13
    // Also used for TimeTrial's "Last Weeks Champion"?
    lobbyPacket.write(this.topDog, 391, 13);
    // char   turfOwner[MAX_CLUB_NAME_LENGTH+1]; = 33 (including the +1)
    lobbyPacket.write(this.turfOwner, 404, 33);
    // DWORD  qualifyingTime;
    lobbyPacket.writeInt32LE(this.qualifyingTime, 437);
    // DWORD   clubNumPlayers;
    lobbyPacket.writeInt32LE(this.clubNumPlayers, 441);
    // DWORD   clubNumLaps;
    lobbyPacket.writeInt32LE(this.clubNumLaps, 445);
    // DWORD   clubNumRounds;
    lobbyPacket.writeInt32LE(this.clubNumRounds, 449);
    // WORD    clubNight;
    lobbyPacket.writeInt16LE(this.clubNight, 453);
    // WORD    clubWeather;
    lobbyPacket.writeInt16LE(this.clubWeather, 457);
    // WORD    clubBackwards;
    lobbyPacket.writeInt16LE(this.clubBackwards, 459);
    // DWORD  bestLapTime; // (64hz ticks)
    lobbyPacket.writeInt32LE(this.bestLapTime, 461);
    // DWORD  lobbyDifficulty;
    lobbyPacket.writeInt32LE(this.lobbyDifficulty, 465);
    // DWORD  ttPointForQualify;
    lobbyPacket.writeInt32LE(this.ttPointForQualify, 469);
    // DWORD  ttCashForQualify;
    lobbyPacket.writeInt32LE(this.ttCashForQualify, 471);
    // DWORD  ttPointBonusFasterIncs;
    lobbyPacket.writeInt32LE(this.ttPointBonusFasterIncs, 475);
    // DWORD  ttCashBonusFasterIncs;
    lobbyPacket.writeInt32LE(this.ttCashBonusFasterIncs, 479);
    // DWORD  ttTimeIncrements;
    lobbyPacket.writeInt32LE(this.ttTimeIncrements, 483);
    // DWORD  ttvictory_1st_points;
    lobbyPacket.writeInt32LE(this.ttvictory_1st_points, 487);
    // DWORD  ttvictory_1st_cash;
    lobbyPacket.writeInt32LE(this.ttvictory_1st_cash, 491);
    // DWORD  ttvictory_2nd_points;
    lobbyPacket.writeInt32LE(this.ttvictory_2nd_points, 495);
    // DWORD  ttvictory_2nd_cash;
    lobbyPacket.writeInt32LE(this.ttvictory_2nd_cash, 499);
    // DWORD  ttvictory_3rd_points;
    lobbyPacket.writeInt32LE(this.ttvictory_3rd_points, 503);
    // DWORD  ttvictory_3rd_cash;
    lobbyPacket.writeInt32LE(this.ttvictory_3rd_cash, 507);
    // WORD   minLevel;
    lobbyPacket.writeInt16LE(this.minLevel, 511);
    // DWORD  minResetSlice;
    lobbyPacket.writeInt32LE(this.minResetSlice, 513);
    // DWORD  maxResetSlice;
    lobbyPacket.writeInt32LE(this.maxResetSlice, 517);
    // WORD   newbieFlag;
    lobbyPacket.writeInt16LE(this.newbieFlag, 521);
    // WORD   driverHelmetFlag;
    lobbyPacket.writeInt16LE(this.driverHelmetFlag, 523);
    // WORD   clubNumPlayersMax;
    lobbyPacket.writeInt16LE(this.clubNumPlayersMax, 525);
    // WORD   clubNumPlayersMin;
    lobbyPacket.writeInt16LE(this.clubNumPlayersMin, 527);
    // WORD   clubNumPlayersDefault;
    lobbyPacket.writeInt16LE(this.clubNumPlayersDefault, 529);
    // WORD   numClubsMin;
    lobbyPacket.writeInt16LE(this.numClubsMin, 531);
    // float  racePointsFactor;
    lobbyPacket.writeInt32LE(this.racePointsFactor, 533);
    // WORD   bodyClassMax;
    lobbyPacket.writeInt16LE(this.bodyClassMax, 537);
    // WORD   powerClassMax;
    lobbyPacket.writeInt16LE(this.powerClassMax, 539);
    // WORD   partPrizesMax;      // max allowed for this lobby
    lobbyPacket.writeInt16LE(this.partPrizesMax, 541);
    // WORD   partPrizesWon;      // current users prizes for this lobby
    lobbyPacket.writeInt16LE(this.partPrizesWon, 543);
    // DWORD  clubLogoID;         // Logo ID for Turf owner
    lobbyPacket.writeInt32LE(this.clubLogoId, 545);
    // WORD   bteamtrialweather;  // Team Trials Weather Flag
    lobbyPacket.writeInt16LE(this.bteamtrialweather, 551);
    // WORD   bteamtrialnight;    // Team Trials Night Flag
    lobbyPacket.writeInt16LE(this.bteamtrialnight, 553);
    // WORD   bteamtrialbackward; // Team Trials Backwards Flag
    lobbyPacket.writeInt16LE(this.bteamtrialbackward, 555);
    // WORD   teamtrialnumlaps;   // Team Trials Number of Laps
    lobbyPacket.writeInt16LE(this.teamtrialnumlaps, 557);
    // DWORD  teamtrialbaseTUP;   // Team Trials Base Time Under Par
    lobbyPacket.writeInt32LE(this.teamtrialbaseTUP, 559);
    // float  raceCashFactor;
    lobbyPacket.writeInt32LE(this.raceCashFactor, 563);

    return lobbyPacket;
  }
}

class LobbyMsg {
  constructor(noLobbies, moreToCome, LobbyInfoArr) {
    this.msgNo = 325;

    this.noLobbies = noLobbies;
    this.moreToCome = moreToCome;
    this.lobbyInfoArr = LobbyInfoArr;

    this.buffer = Buffer.alloc(572);
    this.buffer.writeInt16LE(this.msgNo);
    this.buffer.writeInt16LE(this.noLobbies, 2);
    this.buffer.writeInt8(this.moreToCome, 4);

    this.lobbyList = new LobbyInfo({});
    this.lobbyList.toPacket().copy(this.buffer, 5);

    return this;
  }

  /**
                      * dumpPacket
                      */
  dumpPacket() {
    logger.info('[LobbyMsg]======================================');
    logger.debug('MsgNo:       ', this.msgNo.toString());
    logger.debug('rawBuffer:   ', this.buffer.toString('hex'));
    logger.info('[LobbyMsg]======================================');
  }
}

module.exports = { LobbyInfo, LobbyMsg };
