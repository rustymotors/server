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
    this.lobbyId = lobbyJson.lobbyId;
    // DWORD    raceTypeID;
    this.racetypeId = lobbyJson.racetypeId;
    // DWORD    turfID;
    this.turfId = lobbyJson.turfId;

    // char NPSRiffName[MC_MAX_NPS_RIFF_NAME]; // 32
    this.NPSRiffName = lobbyJson.NPSRiffName;
    // char eTurfName[256];
    this.eTurfName = lobbyJson.eTurfName;
    // char clientArt[11];
    this.clientArt = lobbyJson.clientArt;
    // DWORD    elementID;
    this.elementId = lobbyJson.elementId;
    // DWORD    turfLength;
    this.turfLength = lobbyJson.turfLength;
    // DWORD    startSlice;
    this.startSlice = lobbyJson.startSlice;
    // DWORD    endSlice;
    this.endSlice = lobbyJson.endSlice;
    // float    dragStageLeft;
    this.dragStageLeft = lobbyJson.dragStageLeft;
    // float    dragStageRight;
    this.dragStageRight = lobbyJson.dragStageRight;
    // DWORD    dragStagingSlice;
    this.dragStagingSlice = lobbyJson.dragStagingSlice;
    // float    gridSpreadFactor;
    this.gridSpreadFactor = lobbyJson.gridSpreadFactor;
    // WORD    linear;
    this.linear = lobbyJson.linear;
    // WORD    numplayersmin;
    this.numplayersmin = lobbyJson.numplayersmin;
    // WORD    numplayersmax;
    this.numplayersmax = lobbyJson.numplayersmax;
    // WORD    numplayersdefault;
    this.numplayersdefault = lobbyJson.numplayersdefault;
    // WORD    bnumplayersenabled;
    this.bnumplayersenabled = lobbyJson.bnumplayersenabled;
    // WORD    numlapsmin;
    this.numlapsmin = lobbyJson.numlapsmin;
    // WORD    numlapsmax;
    this.numlapsmax = lobbyJson.numlapsmax;
    // WORD    numlapsdefault;
    this.numlapsdefault = lobbyJson.numlapsdefault;
    // WORD    bnumlapsenabled;
    this.bnumlapsenabled = lobbyJson.bnumlapsenabled;
    // WORD    numroundsmin;
    this.numroundsmin = lobbyJson.numroundsmin;
    // WORD    numroundsmax;
    this.numroundsmax = lobbyJson.numroundsmax;
    // WORD    numroundsdefault;
    this.numroundsdefault = lobbyJson.numroundsdefault;
    // WORD    bnumroundsenabled;
    this.bnumroundsenabled = lobbyJson.bnumroundsenabled;
    // WORD    bweatherdefault;
    this.bweatherdefault = lobbyJson.bweatherdefault;
    // WORD    bweatherenabled;
    this.bweatherenabled = lobbyJson.bweatherenabled;
    // WORD    bnightdefault;
    this.bnightdefault = lobbyJson.bnightdefault;
    // WORD    bnightenabled;
    this.bnightenabled = lobbyJson.bnightenabled;
    // WORD    bbackwarddefault;
    this.bbackwarddefault = lobbyJson.bbackwarddefault;
    // WORD    bbackwardenabled;
    this.bbackwardenabled = lobbyJson.bbackwardenabled;
    // WORD    btrafficdefault;
    this.btrafficdefault = lobbyJson.btrafficdefault;
    // WORD    btrafficenabled;
    this.btrafficenabled = lobbyJson.btrafficenabled;
    // WORD    bdamagedefault;
    this.bdamagedefault = lobbyJson.bdamagedefault;
    // WORD    bdamageenabled;
    this.bdamageenabled = lobbyJson.bdamageenabled;
    // WORD    baidefault;
    this.baidefault = lobbyJson.baidefault;
    // WORD    baienabled;
    this.baienabled = lobbyJson.baienabled;

    // char   topDog[MC_NAME_LENGTH]; = 13
    // Also used for TimeTrial's "Last Weeks Champion"?
    this.topDog = lobbyJson.topDog;
    // char   turfOwner[MAX_CLUB_NAME_LENGTH+1]; = 33 (including the +1)
    this.turfOwner = lobbyJson.turfOwner;
    // DWORD  qualifyingTime;
    this.qualifyingTime = lobbyJson.qualifyingTime;
    // DWORD   clubNumPlayers;
    this.clubNumPlayers = lobbyJson.clubNumPlayers;
    // DWORD   clubNumLaps;
    this.clubNumLaps = lobbyJson.clubNumLaps;
    // DWORD   clubNumRounds;
    this.clubNumRounds = lobbyJson.clubNumRounds;
    // WORD    clubNight;
    this.clubNight = lobbyJson.clubNight;
    // WORD    clubWeather;
    this.clubWeather = lobbyJson.clubWeather;
    // WORD    clubBackwards;
    this.clubBackwards = lobbyJson.clubBackwards;
    // DWORD  bestLapTime; // (64hz ticks)
    this.bestLapTime = lobbyJson.bestLapTime;
    // DWORD  lobbyDifficulty;
    this.lobbyDifficulty = lobbyJson.lobbyDifficulty;
    // DWORD  ttPointForQualify;
    this.ttPointForQualify = lobbyJson.ttPointForQualify;
    // DWORD  ttCashForQualify;
    this.ttCashForQualify = lobbyJson.ttCashForQualify;
    // DWORD  ttPointBonusFasterIncs;
    this.ttPointBonusFasterIncs = lobbyJson.ttPointBonusFasterIncs;
    // DWORD  ttCashBonusFasterIncs;
    this.ttCashBonusFasterIncs = lobbyJson.ttCashBonusFasterIncs;
    // DWORD  ttTimeIncrements;
    this.ttTimeIncrements = lobbyJson.ttTimeIncrements;
    // DWORD  ttvictory_1st_points;
    this.ttvictory_1st_points = lobbyJson.ttvictory_1st_points;
    // DWORD  ttvictory_1st_cash;
    this.ttvictory_1st_cash = lobbyJson.ttvictory_1st_cash;
    // DWORD  ttvictory_2nd_points;
    this.ttvictory_2nd_points = lobbyJson.ttvictory_2nd_points;
    // DWORD  ttvictory_2nd_cash;
    this.ttvictory_2nd_cash = lobbyJson.ttvictory_2nd_cash;
    // DWORD  ttvictory_3rd_points;
    this.ttvictory_3rd_points = lobbyJson.ttvictory_3rd_points;
    // DWORD  ttvictory_3rd_cash;
    this.ttvictory_3rd_cash = lobbyJson.ttvictory_3rd_cash;
    // WORD   minLevel;
    this.minLevel = lobbyJson.minLevel;
    // DWORD  minResetSlice;
    this.minResetSlice = lobbyJson.minResetSlice;
    // DWORD  maxResetSlice;
    this.maxResetSlice = lobbyJson.maxResetSlice;
    // WORD   newbieFlag;
    this.newbieFlag = lobbyJson.newbieFlag;
    // WORD   driverHelmetFlag;
    this.driverHelmetFlag = lobbyJson.driverHelmetFlag;
    // WORD   clubNumPlayersMax;
    this.clubNumPlayersMax = lobbyJson.clubNumPlayersMax;
    // WORD   clubNumPlayersMin;
    this.clubNumPlayersMin = lobbyJson.clubNumPlayersMin;
    // WORD   clubNumPlayersDefault;
    this.clubNumPlayersDefault = lobbyJson.clubNumPlayersDefault;
    // WORD   numClubsMin;
    this.numClubsMin = lobbyJson.numClubsMin;
    // float  racePointsFactor;
    this.racePointsFactor = lobbyJson.racePointsFactor;
    // WORD   bodyClassMax;
    this.bodyClassMax = lobbyJson.bodyClassMax;
    // WORD   powerClassMax;
    this.powerClassMax = lobbyJson.powerClassMax;
    // WORD   partPrizesMax;      // max allowed for this lobby
    this.partPrizesMax = lobbyJson.partPrizesMax;
    // WORD   partPrizesWon;      // current users prizes for this lobby
    this.partPrizesWon = lobbyJson.partPrizesMax;
    // DWORD  clubLogoID;         // Logo ID for Turf owner
    this.clubLogoId = lobbyJson.clubLogoId;
    // WORD   bteamtrialweather;  // Team Trials Weather Flag
    this.bteamtrialweather = lobbyJson.bteamtrialweather;
    // WORD   bteamtrialnight;    // Team Trials Night Flag
    this.bteamtrialnight = lobbyJson.bteamtrialnight;
    // WORD   bteamtrialbackward; // Team Trials Backwards Flag
    this.bteamtrialbackward = lobbyJson.bteamtrialbackward;
    // WORD   teamtrialnumlaps;   // Team Trials Number of Laps
    this.teamtrialnumlaps = lobbyJson.teamtrialnumlaps;
    // DWORD  teamtrialbaseTUP;   // Team Trials Base Time Under Par
    this.teamtrialbaseTUP = lobbyJson.teamtrialbaseTUP;
    // float  raceCashFactor;
    this.raceCashFactor = lobbyJson.raceCashFactor;
  }
}

class LobbyMsg {
  constructor(noLobbies, moreToCome, LobbyInfoArr) {
    this.msgNo = 325;

    this.noLobbies = noLobbies;
    this.moreToCome = moreToCome;
    this.lobbyInfoArr = LobbyInfoArr;

    this.buffer = Buffer.alloc(5);
    this.buffer.writeInt16LE(this.msgNo);
    this.buffer.writeInt16LE(this.noLobbies, 2);
    this.buffer.writeInt8(this.moreToCome, 4);

    logger.debug(this.buffer);

    return this;
  }

  /**
                      * dumpPacket
                      */
  dumpPacket() {
    logger.info('[LobbyMsg]======================================');
    logger.debug('MsgNo:       ', this.msgNo.toString());
    logger.info('[LobbyMsg]======================================');
  }
}

module.exports = { LobbyInfo, LobbyMsg };
