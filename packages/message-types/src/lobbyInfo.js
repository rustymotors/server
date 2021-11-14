const { Buffer } = require("buffer");

/**
 * Object for Loby information
 * @exports
 * @typedef {Object} LobbyInfo
 * @property {number} raceCashFactor
 * @property {number} teamtrialbaseTUP
 * @property {number} teamtrialnumlaps
 * @property {number} bteamtrialbackward
 * @property {number} bteamtrialnight
 * @property {number} clubLogoId
 * @property {number} partPrizesWon
 * @property {number} partPrizesMax
 * @property {number} powerClassMax
 * @property {number} bodyClassMax
 * @property {number} racePointsFactor
 * @property {number} numClubsMin
 * @property {number} numClubsMin
 * @property {number} clubNumPlayersDefault
 * @property {number} clubNumPlayersMin
 * @property {number} clubNumPlayersMax
 * @property {number} driverHelmetFlag
 * @property {number} newbieFlag
 * @property {number} maxResetSlice
 * @property {number} minResetSlice
 * @property {number} minLevel
 * @property {number} ttvictory_3rd_cash
 * @property {number} ttvictory_3rd_points
 * @property {number} ttvictory_2nd_cash
 * @property {number} ttvictory_2nd_points
 * @property {number} ttvictory_1st_cash
 * @property {number} ttvictory_1st_points
 * @property {number} ttTimeIncrements
 * @property {number} ttCashBonusFasterIncs
 * @property {number} ttPointBonusFasterIncs
 * @property {number} ttCashForQualify
 * @property {number} ttPointForQualify
 * @property {number} lobbyDifficulty
 * @property {number} bestLapTime
 * @property {number} clubBackwards
 * @property {number} clubWeather
 * @property {number} clubNight
 * @property {number} clubNumRounds
 * @property {number} clubNumLaps
 * @property {number} clubNumPlayers
 * @property {number} qualifyingTime
 * @property {number} turfOwner
 * @property {number} topDog
 * @property {number} baienabled
 * @property {number} baidefault
 * @property {number} bdamageenabled
 * @property {number} bdamagedefault
 * @property {number} btrafficenabled
 * @property {number} btrafficdefault
 * @property {number} bbackwardenabled
 * @property {number} bbackwarddefault
 * @property {number} bnightenabled
 * @property {number} bnightdefault
 * @property {number} bweatherenabled
 * @property {number} bweatherdefault
 * @property {number} bnumroundsenabled
 * @property {number} numrouundsdefault
 * @property {number} numroundsmax
 * @property {number} numroundsmin
 * @property {number} bnumlapsenabled
 * @property {number} numlapsdefault
 * @property {number} numlapsmax
 * @property {number} numlapsmin
 * @property {number} bnumplayersenabled
 * @property {number} numplayersdefault
 * @property {number} numplayersmax
 * @property {number} numplayersmin
 * @property {number} linear
 * @property {number} gridSpreadFactor
 * @property {number} dragStagingSlice
 * @property {number} dragStageRight
 * @property {number} dragStageLeft
 * @property {number} endSlice
 * @property {number} startSlice
 * @property {number} turfLength
 * @property {number} elementId
 * @property {number} clientArt
 * @property {number} eTurfName
 * @property {string} NPSRiffName
 * @property {number} turfId
 * @property {number} racetypeId
 * @property {number} lobbyId
 */

/** @type {LobbyInfo} */
const lobbyInfoDefaults = {
  // DWORD    lobbyID;
  lobbyId: 0,
  // DWORD    raceTypeID;
  racetypeId: 0,
  // DWORD    turfID;
  turfId: 0,

  // Char NPSRiffName[MC_MAX_NPS_RIFF_NAME]; // 32
  NPSRiffName: "main",
  // Char eTurfName[256];
  eTurfName: "",
  // Char clientArt[11];
  clientArt: "",
  // DWORD    elementID;
  elementId: 0,
  // DWORD    turfLength;
  turfLength: 0,
  // DWORD    startSlice;
  startSlice: 0,
  // DWORD    endSlice;
  endSlice: 0,
  // Float    dragStageLeft;
  dragStageLeft: 0,
  // Float    dragStageRight;
  dragStageRight: 0,
  // DWORD    dragStagingSlice;
  dragStagingSlice: 0,
  // Float    gridSpreadFactor;
  gridSpreadFactor: 0,
  // WORD    linear;
  linear: 0,
  // WORD    numplayersmin;
  numplayersmin: 0,
  // WORD    numplayersmax;
  numplayersmax: 5,
  // WORD    numplayersdefault;
  numplayersdefault: 1,
  // WORD    bnumplayersenabled;
  bnumplayersenabled: 0,
  // WORD    numlapsmin;
  numlapsmin: 1,
  // WORD    numlapsmax;
  numlapsmax: 5,
  // WORD    numlapsdefault;
  numlapsdefault: 1,
  // WORD    bnumlapsenabled;
  bnumlapsenabled: 0,
  // WORD    numroundsmin;
  numroundsmin: 1,
  // WORD    numroundsmax;
  numroundsmax: 5,
  // WORD    numroundsdefault;
  numroundsdefault: 1,
  // WORD    bnumroundsenabled;
  bnumroundsenabled: 0,
  // WORD    bweatherdefault;
  bweatherdefault: 0,
  // WORD    bweatherenabled;
  bweatherenabled: 0,
  // WORD    bnightdefault;
  bnightdefault: 0,
  // WORD    bnightenabled;
  bnightenabled: 0,
  // WORD    bbackwarddefault;
  bbackwarddefault: 0,
  // WORD    bbackwardenabled;
  bbackwardenabled: 0,
  // WORD    btrafficdefault;
  btrafficdefault: 0,
  // WORD    btrafficenabled;
  btrafficenabled: 0,
  // WORD    bdamagedefault;
  bdamagedefault: 0,
  // WORD    bdamageenabled;
  bdamageenabled: 0,
  // WORD    baidefault;
  baidefault: 0,
  // WORD    baienabled;
  baienabled: 0,

  // Char   topDog[MC_NAME_LENGTH]; = 13
  // Also used for TimeTrial's "Last Weeks Champion"?
  topDog: "",
  // Char   turfOwner[MAX_CLUB_NAME_LENGTH+1]; = 33 (including the +1)
  turfOwner: "",
  // DWORD  qualifyingTime;
  qualifyingTime: 0,
  // DWORD   clubNumPlayers;
  clubNumPlayers: 1,
  // DWORD   clubNumLaps;
  clubNumLaps: 1,
  // DWORD   clubNumRounds;
  clubNumRounds: 1,
  // WORD    clubNight;
  clubNight: 0,
  // WORD    clubWeather;
  clubWeather: 0,
  // WORD    clubBackwards;
  clubBackwards: 0,
  // DWORD  bestLapTime; // (64hz ticks)
  bestLapTime: 0,
  // DWORD  lobbyDifficulty;
  lobbyDifficulty: 0,
  // DWORD  ttPointForQualify;
  ttPointForQualify: 0,
  // DWORD  ttCashForQualify;
  ttCashForQualify: 0,
  // DWORD  ttPointBonusFasterIncs;
  ttPointBonusFasterIncs: 1,
  // DWORD  ttCashBonusFasterIncs;
  ttCashBonusFasterIncs: 1,
  // DWORD  ttTimeIncrements;
  ttTimeIncrements: 1,
  // DWORD  ttvictory_1st_points;
  ttvictory_1st_points: 1,
  // DWORD  ttvictory_1st_cash;
  ttvictory_1st_cash: 1,
  // DWORD  ttvictory_2nd_points;
  ttvictory_2nd_points: 2,
  // DWORD  ttvictory_2nd_cash;
  ttvictory_2nd_cash: 2,
  // DWORD  ttvictory_3rd_points;
  ttvictory_3rd_points: 3,
  // DWORD  ttvictory_3rd_cash;
  ttvictory_3rd_cash: 3,
  // WORD   minLevel;
  minLevel: 0,
  // DWORD  minResetSlice;
  minResetSlice: 0,
  // DWORD  maxResetSlice;
  maxResetSlice: 1,
  // WORD   newbieFlag;
  newbieFlag: 1,
  // WORD   driverHelmetFlag;
  driverHelmetFlag: 0,
  // WORD   clubNumPlayersMax;
  clubNumPlayersMax: 1,
  // WORD   clubNumPlayersMin;
  clubNumPlayersMin: 0,
  // WORD   clubNumPlayersDefault;
  clubNumPlayersDefault: 0,
  // WORD   numClubsMin;
  numClubsMin: 0,
  // Float  racePointsFactor;
  racePointsFactor: 1,
  // WORD   bodyClassMax;
  bodyClassMax: 10,
  // WORD   powerClassMax;
  powerClassMax: 10,
  // WORD   partPrizesMax;      // max allowed for this lobby
  partPrizesMax: 1,
  // WORD   partPrizesWon;      // current users prizes for this lobby
  partPrizesWon: 1,
  // DWORD  clubLogoID;         // Logo ID for Turf owner
  clubLogoId: 0,
  // WORD   bteamtrialweather;  // Team Trials Weather Flag
  bteamtrialweather: 0,
  // WORD   bteamtrialnight;    // Team Trials Night Flag
  bteamtrialnight: 0,
  // WORD   bteamtrialbackward; // Team Trials Backwards Flag
  bteamtrialbackward: 0,
  // WORD   teamtrialnumlaps;   // Team Trials Number of Laps
  teamtrialnumlaps: 0,
  // DWORD  teamtrialbaseTUP;   // Team Trials Base Time Under Par
  teamtrialbaseTUP: 0,
  // Float  raceCashFactor;
  raceCashFactor: 1,
};

/**
 * @class
 * @property {ILobbyInfo} data
 */
class LobbyInfoPacket {
  /** @type {LobbyInfo} */
  data;
  /**
   *
   */
  constructor() {
    this.data = lobbyInfoDefaults;
  }

  /**
   *
   * @return {Buffer}
   */
  toPacket() {
    const lobbyPacket = Buffer.alloc(567);

    lobbyPacket.writeInt32LE(this.data.lobbyId, 0);
    lobbyPacket.writeInt32LE(this.data.racetypeId, 4);
    lobbyPacket.writeInt32LE(this.data.turfId, 8);

    lobbyPacket.write(this.data.NPSRiffName, 12, 32);
    // Char eTurfName[256];
    lobbyPacket.write(this.data.eTurfName, 44, 256);
    // Char clientArt[11];
    lobbyPacket.write(this.data.clientArt, 300, 11);
    // DWORD    elementID;
    lobbyPacket.writeInt32LE(this.data.elementId, 311);
    // DWORD    turfLength;
    lobbyPacket.writeInt32LE(this.data.turfLength, 315);
    // DWORD    startSlice;
    lobbyPacket.writeInt32LE(this.data.startSlice, 319);
    // DWORD    endSlice;
    lobbyPacket.writeInt32LE(this.data.endSlice, 323);
    // Float    dragStageLeft;
    lobbyPacket.writeInt32LE(this.data.dragStageLeft, 327);
    // Float    dragStageRight;
    lobbyPacket.writeInt32LE(this.data.dragStageRight, 331);
    // DWORD    dragStagingSlice;
    lobbyPacket.writeInt32LE(this.data.dragStagingSlice, 335);
    // Float    gridSpreadFactor;
    lobbyPacket.writeInt32LE(this.data.gridSpreadFactor, 339);
    // WORD    linear;
    lobbyPacket.writeInt16LE(this.data.linear, 341);
    // WORD    numplayersmin;
    lobbyPacket.writeInt16LE(this.data.numplayersmin, 343);
    // WORD    numplayersmax;
    lobbyPacket.writeInt16LE(this.data.numplayersmax, 345);
    // WORD    numplayersdefault;
    lobbyPacket.writeInt16LE(this.data.numplayersdefault, 347);
    // WORD    bnumplayersenabled;
    lobbyPacket.writeInt16LE(this.data.bnumplayersenabled, 349);
    // WORD    numlapsmin;
    lobbyPacket.writeInt16LE(this.data.numlapsmin, 351);
    // WORD    numlapsmax;
    lobbyPacket.writeInt16LE(this.data.numlapsmax, 353);
    // WORD    numlapsdefault;
    lobbyPacket.writeInt16LE(this.data.numlapsdefault, 355);
    // WORD    bnumlapsenabled;
    lobbyPacket.writeInt16LE(this.data.bnumlapsenabled, 357);
    // WORD    numroundsmin;
    lobbyPacket.writeInt16LE(this.data.numroundsmin, 359);
    // WORD    numroundsmax;
    lobbyPacket.writeInt16LE(this.data.numroundsmax, 361);
    // WORD    numroundsdefault;
    lobbyPacket.writeInt16LE(this.data.numroundsdefault, 363);
    // WORD    bnumroundsenabled;
    lobbyPacket.writeInt16LE(this.data.bnumroundsenabled, 365);
    // WORD    bweatherdefault;
    lobbyPacket.writeInt16LE(this.data.bweatherdefault, 367);
    // WORD    bweatherenabled;
    lobbyPacket.writeInt16LE(this.data.bweatherenabled, 367);
    // WORD    bnightdefault;
    lobbyPacket.writeInt16LE(this.data.bnightdefault, 369);
    // WORD    bnightenabled;
    lobbyPacket.writeInt16LE(this.data.bnightenabled, 371);
    // WORD    bbackwarddefault;
    lobbyPacket.writeInt16LE(this.data.bbackwarddefault, 373);
    // WORD    bbackwardenabled;
    lobbyPacket.writeInt16LE(this.data.bbackwardenabled, 375);
    // WORD    btrafficdefault;
    lobbyPacket.writeInt16LE(this.data.btrafficdefault, 379);
    // WORD    btrafficenabled;
    lobbyPacket.writeInt16LE(this.data.btrafficenabled, 381);
    // WORD    bdamagedefault;
    lobbyPacket.writeInt16LE(this.data.bdamagedefault, 383);
    // WORD    bdamageenabled;
    lobbyPacket.writeInt16LE(this.data.bdamageenabled, 385);
    // WORD    baidefault;
    lobbyPacket.writeInt16LE(this.data.baidefault, 387);
    // WORD    baienabled;
    lobbyPacket.writeInt16LE(this.data.baienabled, 389);

    // Char   topDog[MC_NAME_LENGTH]; = 13
    // Also used for TimeTrial's "Last Weeks Champion"?
    lobbyPacket.write(this.data.topDog, 391, 13);
    // Char   turfOwner[MAX_CLUB_NAME_LENGTH+1]; = 33 (including the +1)
    lobbyPacket.write(this.data.turfOwner, 404, 33);
    // DWORD  qualifyingTime;
    lobbyPacket.writeInt32LE(this.data.qualifyingTime, 437);
    // DWORD   clubNumPlayers;
    lobbyPacket.writeInt32LE(this.data.clubNumPlayers, 441);
    // DWORD   clubNumLaps;
    lobbyPacket.writeInt32LE(this.data.clubNumLaps, 445);
    // DWORD   clubNumRounds;
    lobbyPacket.writeInt32LE(this.data.clubNumRounds, 449);
    // WORD    clubNight;
    lobbyPacket.writeInt16LE(this.data.clubNight, 453);
    // WORD    clubWeather;
    lobbyPacket.writeInt16LE(this.data.clubWeather, 457);
    // WORD    clubBackwards;
    lobbyPacket.writeInt16LE(this.data.clubBackwards, 459);
    // DWORD  bestLapTime; // (64hz ticks)
    lobbyPacket.writeInt32LE(this.data.bestLapTime, 461);
    // DWORD  lobbyDifficulty;
    lobbyPacket.writeInt32LE(this.data.lobbyDifficulty, 465);
    // DWORD  ttPointForQualify;
    lobbyPacket.writeInt32LE(this.data.ttPointForQualify, 469);
    // DWORD  ttCashForQualify;
    lobbyPacket.writeInt32LE(this.data.ttCashForQualify, 471);
    // DWORD  ttPointBonusFasterIncs;
    lobbyPacket.writeInt32LE(this.data.ttPointBonusFasterIncs, 475);
    // DWORD  ttCashBonusFasterIncs;
    lobbyPacket.writeInt32LE(this.data.ttCashBonusFasterIncs, 479);
    // DWORD  ttTimeIncrements;
    lobbyPacket.writeInt32LE(this.data.ttTimeIncrements, 483);
    // DWORD  ttvictory_1st_points;
    lobbyPacket.writeInt32LE(this.data.ttvictory_1st_points, 487);
    // DWORD  ttvictory_1st_cash;
    lobbyPacket.writeInt32LE(this.data.ttvictory_1st_cash, 491);
    // DWORD  ttvictory_2nd_points;
    lobbyPacket.writeInt32LE(this.data.ttvictory_2nd_points, 495);
    // DWORD  ttvictory_2nd_cash;
    lobbyPacket.writeInt32LE(this.data.ttvictory_2nd_cash, 499);
    // DWORD  ttvictory_3rd_points;
    lobbyPacket.writeInt32LE(this.data.ttvictory_3rd_points, 503);
    // DWORD  ttvictory_3rd_cash;
    lobbyPacket.writeInt32LE(this.data.ttvictory_3rd_cash, 507);
    // WORD   minLevel;
    lobbyPacket.writeInt16LE(this.data.minLevel, 511);
    // DWORD  minResetSlice;
    lobbyPacket.writeInt32LE(this.data.minResetSlice, 513);
    // DWORD  maxResetSlice;
    lobbyPacket.writeInt32LE(this.data.maxResetSlice, 517);
    // WORD   newbieFlag;
    lobbyPacket.writeInt16LE(this.data.newbieFlag, 521);
    // WORD   driverHelmetFlag;
    lobbyPacket.writeInt16LE(this.data.driverHelmetFlag, 523);
    // WORD   clubNumPlayersMax;
    lobbyPacket.writeInt16LE(this.data.clubNumPlayersMax, 525);
    // WORD   clubNumPlayersMin;
    lobbyPacket.writeInt16LE(this.data.clubNumPlayersMin, 527);
    // WORD   clubNumPlayersDefault;
    lobbyPacket.writeInt16LE(this.data.clubNumPlayersDefault, 529);
    // WORD   numClubsMin;
    lobbyPacket.writeInt16LE(this.data.numClubsMin, 531);
    // Float  racePointsFactor;
    lobbyPacket.writeInt32LE(this.data.racePointsFactor, 533);
    // WORD   bodyClassMax;
    lobbyPacket.writeInt16LE(this.data.bodyClassMax, 537);
    // WORD   powerClassMax;
    lobbyPacket.writeInt16LE(this.data.powerClassMax, 539);
    // WORD   partPrizesMax;      // max allowed for this lobby
    lobbyPacket.writeInt16LE(this.data.partPrizesMax, 541);
    // WORD   partPrizesWon;      // current users prizes for this lobby
    lobbyPacket.writeInt16LE(this.data.partPrizesWon, 543);
    // DWORD  clubLogoID;         // Logo ID for Turf owner
    lobbyPacket.writeInt32LE(this.data.clubLogoId, 545);
    // WORD   bteamtrialweather;  // Team Trials Weather Flag
    lobbyPacket.writeInt16LE(this.data.bteamtrialweather, 551);
    // WORD   bteamtrialnight;    // Team Trials Night Flag
    lobbyPacket.writeInt16LE(this.data.bteamtrialnight, 553);
    // WORD   bteamtrialbackward; // Team Trials Backwards Flag
    lobbyPacket.writeInt16LE(this.data.bteamtrialbackward, 555);
    // WORD   teamtrialnumlaps;   // Team Trials Number of Laps
    lobbyPacket.writeInt16LE(this.data.teamtrialnumlaps, 557);
    // DWORD  teamtrialbaseTUP;   // Team Trials Base Time Under Par
    lobbyPacket.writeInt32LE(this.data.teamtrialbaseTUP, 559);
    // Float  raceCashFactor;
    lobbyPacket.writeInt32LE(this.data.raceCashFactor, 563);

    return lobbyPacket;
  }
}
module.exports = { LobbyInfoPacket };
