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
  // WORD    numroundsmin;
  // WORD    numroundsmax;
  // WORD    numroundsdefault;
  // WORD    bnumroundsenabled;
  // WORD    bweatherdefault;
  // WORD    bweatherenabled;
  // WORD    bnightdefault;
  // WORD    bnightenabled;
  // WORD    bbackwarddefault;
  // WORD    bbackwardenabled;
  // WORD    btrafficdefault;
  // WORD    btrafficenabled;
  // WORD    bdamagedefault;
  // WORD    bdamageenabled;
  // WORD    baidefault;
  // WORD    baienabled;
  // char   topDog[MC_NAME_LENGTH]; // Also used for TimeTrial's "Last Weeks Champion"?
  // char   turfOwner[MAX_CLUB_NAME_LENGTH+1];
  // DWORD  qualifyingTime;
  // DWORD   clubNumPlayers;
  // DWORD   clubNumLaps;
  // DWORD   clubNumRounds;
  // WORD    clubNight;
  // WORD    clubWeather;
  // WORD    clubBackwards;
  // DWORD  bestLapTime; // (64hz ticks)
  // DWORD  lobbyDifficulty;
  // DWORD  ttPointForQualify;
  // DWORD  ttCashForQualify;
  // DWORD  ttPointBonusFasterIncs;
  // DWORD  ttCashBonusFasterIncs;
  // DWORD  ttTimeIncrements;

  // DWORD  ttvictory_1st_points;
  // DWORD  ttvictory_1st_cash;
  // DWORD  ttvictory_2nd_points;
  // DWORD  ttvictory_2nd_cash;
  // DWORD  ttvictory_3rd_points;
  // DWORD  ttvictory_3rd_cash;
  // WORD   minLevel;
  // DWORD  minResetSlice;
  // DWORD  maxResetSlice;
  // WORD   newbieFlag;
  // WORD   driverHelmetFlag;
  // WORD   clubNumPlayersMax;
  // WORD   clubNumPlayersMin;
  // WORD   clubNumPlayersDefault;
  // WORD   numClubsMax;
  // WORD   numClubsMin;
  // float  racePointsFactor;
  // WORD   bodyClassMax;
  // WORD   powerClassMax;

  // WORD   partPrizesMax;      // max allowed for this lobby
  // WORD   partPrizesWon;      // current users prizes for this lobby
  // DWORD  clubLogoID;         // Logo ID for Turf owner
  // WORD   bteamtrialweather;  // Team Trials Weather Flag
  // WORD   bteamtrialnight;    // Team Trials Night Flag
  // WORD   bteamtrialbackward; // Team Trials Backwards Flag
  // WORD   teamtrialnumlaps;   // Team Trials Number of Laps
  // DWORD  teamtrialbaseTUP;   // Team Trials Base Time Under Par
  // float  raceCashFactor;
  constructor(lobbyId, racetypeId, turfId, NPSRiffName, eTurfName, clientArt, elementId,
    turfLength, startSlice, endSlice, dragStageLeft, dragStageRight, dragStagingSlice,
    gridSpreadFactor, linear, numplayersmin, numplayersmax, numplayersdefault,
    bnumplayersenabled, numlapsmin, numlapsmax, numlapsdefault, bnumlapsenabled) {
    // DWORD    lobbyID;
    this.lobbyId = lobbyId;
    // DWORD    raceTypeID;
    this.racetypeId = racetypeId;
    // DWORD    turfID;
    this.turfId = turfId;

    // char NPSRiffName[MC_MAX_NPS_RIFF_NAME]; // 32
    this.NPSRiffName = NPSRiffName;
    // char eTurfName[256];
    this.eTurfName = eTurfName;
    // char clientArt[11];
    this.clientArt = clientArt;
    // DWORD    elementID;
    this.elementId = elementId;
    // DWORD    turfLength;
    this.turfLength = turfLength;
    // DWORD    startSlice;
    this.startSlice = startSlice;
    // DWORD    endSlice;
    this.endSlice = endSlice;
    // float    dragStageLeft;
    this.dragStageLeft = dragStageLeft;
    // float    dragStageRight;
    this.dragStageRight = dragStageRight;
    // DWORD    dragStagingSlice;
    this.dragStagingSlice = dragStagingSlice;
    // float    gridSpreadFactor;
    this.gridSpreadFactor = gridSpreadFactor;
    // WORD    linear;
    this.linear = linear;
    // WORD    numplayersmin;
    this.numplayersmin = numplayersmin;
    // WORD    numplayersmax;
    this.numplayersmax = numplayersmax;
    // WORD    numplayersdefault;
    this.numplayersdefault = numplayersdefault;
    // WORD    bnumplayersenabled;
    this.bnumplayersenabled = bnumplayersenabled;
    // WORD    numlapsmin;
    this.numlapsmin = numlapsmin;
    // WORD    numlapsmax;
    this.numlapsmax = numlapsmax;
    // WORD    numlapsdefault;
    this.numlapsdefault = numlapsdefault;
    // WORD    bnumlapsenabled;
    this.bnumlapsenabled = bnumlapsenabled;
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
    logger.debug('customerId:  ', this.customerId.toString());
    logger.debug('personaId:   ', this.personaId.toString());
    logger.info('[LobbyMsg]======================================');
  }
}

module.exports = { LobbyInfo, LobbyMsg };
