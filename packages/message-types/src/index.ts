import { Logger } from '@drazisil/mco-logger'

const { log } = Logger.getInstance()

// WORD  msgNo;    // typically MC_SUCCESS or MC_FAILURE
// WORD  msgReply; // message # being replied to (ex: MC_PURCHASE_STOCK_CAR)
// DWORD result; // specific to the message sent, often the reason for a failure
// DWORD data;   // specific to the message sent (but usually 0)
// DWORD data2;

/**
 * @module GenericReplyMsg
 */

/**
 * @class
 * @property {number} msgNo
 * @property {number} toFrom
 * @property {number} appId
 * @property {number} msgReply
 * @property {Buffer} result
 * @property {Buffer} data
 * @property {Buffer} data2
 */
export class GenericReplyMessage {
  msgNo: number
  toFrom: number
  appId: number
  msgReply: number
  result: Buffer
  data: Buffer
  data2: Buffer
  /**
   *
   */
  constructor() {
    this.msgNo = 0
    this.toFrom = 0
    this.appId = 0
    this.msgReply = 0
    this.result = Buffer.alloc(4)
    this.data = Buffer.alloc(4)
    this.data2 = Buffer.alloc(4)
  }

  /**
   * Setter data
   * @param {Buffer} value
   * @return {void}
   */
  setData(value: Buffer): void {
    this.data = value
  }

  /**
   * Setter data2
   * @param {Buffer} value
   * @return {void}
   */
  setData2(value: Buffer): void {
    this.data2 = value
  }

  /**
   *
   * @param {Buffer} buffer
   * @return {void}
   */
  deserialize(buffer: Buffer): void {
    try {
      this.msgNo = buffer.readInt16LE(0)
    } catch (error) {
      if (error instanceof RangeError) {
        // This is likeley not an MCOTS packet, ignore
      } else {
        throw new TypeError(
          `[GenericReplyMsg] Unable to read msgNo from ${buffer.toString(
            'hex',
          )}: ${error}`,
        )
      }
    }

    this.msgReply = buffer.readInt16LE(2)
    this.result = buffer.slice(4, 8)
    this.data = buffer.slice(8, 12)
    this.data2 = buffer.slice(12)
  }

  /**
   *
   * @return {Buffer}
   */
  serialize(): Buffer {
    const packet = Buffer.alloc(16)
    packet.writeInt16LE(this.msgNo, 0)
    packet.writeInt16LE(this.msgReply, 2)
    this.result.copy(packet, 4)
    this.data.copy(packet, 8)
    this.data2.copy(packet, 12)
    return packet
  }

  /**
   *
   * @param {Buffer} buffer
   * @return {void}
   */
  setResult(buffer: Buffer): void {
    this.result = buffer
  }

  /**
   * DumpPacket
   * @return {void}
   */
  dumpPacket(): void {
    log(
      'info',
      `GenericReply',
      ${JSON.stringify({
        msgNo: this.msgNo,
        msgReply: this.msgReply,
        result: this.result.toString('hex'),
        data: this.data.toString('hex'),
        tdata2: this.data2.toString('hex'),
      })}`,
      { service: 'mcoserver:GenericReplyMsg' },
    )
  }
}

/**
 * @module GenericRequestMsg
 */

// WORD  msgNo;    // typically MC_SUCCESS or MC_FAILURE
// DWORD data;   // specific to the message sent (but usually 0)
// DWORD data2;

/**
 *
 *
 * @class
 * @property {number} msgNo
 * @property {Buffer} data
 * @property {Buffer} data2
 */
 export class GenericRequestMessage {
    msgNo: number
    data: Buffer
    data2: Buffer
    serviceName: string
    /**
     *
     */
    constructor() {
      this.msgNo = 0
      this.data = Buffer.alloc(4)
      this.data2 = Buffer.alloc(4)
      this.serviceName = 'mcoserver:GenericRequestMsg'
    }
  
    /**
     *
     * @param {Buffer} buffer
     * @return {void}
     */
    deserialize(buffer: Buffer): void {
      try {
        this.msgNo = buffer.readInt16LE(0)
      } catch (error) {
        if (error instanceof RangeError) {
          // This is likeley not an MCOTS packet, ignore
        } else {
          throw new TypeError(
            `[GenericRequestMsg] Unable to read msgNo from ${buffer.toString(
              'hex',
            )}: ${error}`,
          )
        }
      }
  
      this.data = buffer.slice(2, 6)
      this.data2 = buffer.slice(6)
    }
  
    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer {
      const packet = Buffer.alloc(16)
      packet.writeInt16LE(this.msgNo, 0)
      this.data.copy(packet, 2)
      this.data2.copy(packet, 6)
      return packet
    }
  
    /**
     * DumpPacket
     * @return {void}
     */
    dumpPacket(): void {
      log(
        'info',
        `GenericRequest',
        ${JSON.stringify({
          msgNo: this.msgNo,
          data: this.data.toString('hex'),
          data2: this.data2.toString('hex'),
        })}`,
        { service: this.serviceName },
      )
    }
  }

  /**
 * Container objest for Stock cars
 * @module StockCar
 */

// DWORD   brandedPartID;
// DWORD   retailPrice;
// WORD    bIsDealOfTheDay;

/**
 * @class
 * @property {number} brandedPartId
 * @property {number} retailPrice
 * @property {0 | 1} bIsDealOfTheDay
 */
export class StockCar {
    brandedPartId: number
    retailPrice: number
    bIsDealOfTheDay: number
    serviceName: string
    /**
     * @param {number} brandedPartId
     * @param {number} retailPrice
     * @param {0|1} bIsDealOfTheDay
     */
    constructor(
      brandedPartId: number,
      retailPrice: number,
      bIsDealOfTheDay: number,
    ) {
      this.brandedPartId = brandedPartId
      this.retailPrice = retailPrice
      this.bIsDealOfTheDay = bIsDealOfTheDay
      this.serviceName = 'mcoserver:StockCar'
    }
  
    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer {
      const packet = Buffer.alloc(10)
      packet.writeInt32LE(this.brandedPartId, 0)
      packet.writeInt32LE(this.retailPrice, 4)
      packet.writeInt16LE(this.bIsDealOfTheDay, 8)
      return packet
    }
  
    /**
     * DumpPacket
     * @return {void}
     */
    dumpPacket(): void {
      log(
        'debug',
        `
      [StockCar]======================================
      brandedPartId:     ${this.brandedPartId}
      retailPrice:       ${this.retailPrice}
      isDealOfTheDay:    ${this.bIsDealOfTheDay}
      logger.log('[/StockCar]======================================`,
        { service: this.serviceName },
      )
    }
  }

  /**
 * Object for providing information on stock cars
 * @module StockCarInfoMsg
 */

// WORD     msgNo;
// DWORD    starterCash; // when called from the create persona screen,
//                      //  this indicates how much cash a persona starts out with
// DWORD    dealerID;   // for easy match up
// DWORD    brand;
// WORD     noCars;
// BYTE     moreToCome;     // if 1, expect another msg, otherwise don't
// StockCar carInfo[1];

/**
 * @class
 * @property {number} msgNo
 * @property {number} starterCash
 * @property {number} dealerId
 * @property {number} brand
 * @property {number} noCars
 * @property {number} moreToCome
 * @property {StockCar[]} StockCarList
 */
export class StockCarInfoMessage {
    msgNo: number
    starterCash: number
    dealerId: number
    brand: number
    noCars: number
    moreToCome: number
    StockCarList: StockCar[]
    serviceName: string
    /**
     * Creates an instance of StockCarInfoMsg.
     * @class
     * @param {number} starterCash
     * @param {number} dealerId
     * @param {number} brand
     * @memberof StockCarInfoMsg
     */
    constructor(starterCash: number, dealerId: number, brand: number) {
      this.msgNo = 141
      this.starterCash = starterCash
      this.dealerId = dealerId
      this.brand = brand
      /** Number of cars */
      this.noCars = 1
      /** @type {0|1} */
      this.moreToCome = 0
      /** @type {module:StockCar} */
      this.StockCarList = []
      this.serviceName = 'mcoserver:StockCarInfoMsg'
    }
  
    /**
     *
     * @param {StockCar} car
     * @return {void}
     */
    addStockCar(car: StockCar): void {
      this.StockCarList.push(car)
      this.noCars = this.StockCarList.length
    }
  
    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer {
      // This does not count the StockCar array
      const packet = Buffer.alloc((17 + 9) * this.StockCarList.length)
      packet.writeInt16LE(this.msgNo, 0)
      packet.writeInt32LE(this.starterCash, 2)
      packet.writeInt32LE(this.dealerId, 6)
      packet.writeInt32LE(this.brand, 10)
      packet.writeInt16LE(this.noCars, 14)
      packet.writeInt8(this.moreToCome, 16)
      if (this.StockCarList.length > 0) {
        for (const [i, stockCar] of this.StockCarList.entries()) {
          const offset = 10 * i
          stockCar.serialize().copy(packet, 17 + offset)
        }
      }
  
      return packet
    }
  
    /**
     * DumpPacket
     * @return {void}
     */
    dumpPacket(): void {
      log(
        'debug',
        `${JSON.stringify({
          msgNo: this.msgNo,
          starterCash: this.starterCash,
          dealerId: this.dealerId,
          brand: this.brand,
          noCars: this.noCars,
          moreToCome: this.moreToCome,
          stockCarList: this.StockCarList.toString(),
        })}`,
        { service: this.serviceName },
      )
    }
  }

  /**
 * Object for Loby information
 * @module LobbyInfo
 */

export interface ILobbyInfo {
    raceCashFactor: number
    teamtrialbaseTUP: number
    teamtrialnumlaps: number
    bteamtrialbackward: number
    bteamtrialnight: number
    bteamtrialweather: number
    clubLogoId: number
    partPrizesWon: number
    partPrizesMax: number
    powerClassMax: number
    bodyClassMax: number
    racePointsFactor: number
    numClubsMin: number
    clubNumPlayersDefault: number
    clubNumPlayersMin: number
    clubNumPlayersMax: number
    driverHelmetFlag: number
    newbieFlag: number
    maxResetSlice: number
    minResetSlice: number
    minLevel: number
    ttvictory_3rd_cash: number
    ttvictory_3rd_points: number
    ttvictory_2nd_cash: number
    ttvictory_2nd_points: number
    ttvictory_1st_cash: number
    ttvictory_1st_points: number
    ttTimeIncrements: number
    ttCashBonusFasterIncs: number
    ttPointBonusFasterIncs: number
    ttCashForQualify: number
    ttPointForQualify: number
    lobbyDifficulty: number
    bestLapTime: number
    clubBackwards: number
    clubWeather: number
    clubNight: number
    clubNumRounds: number
    clubNumLaps: number
    clubNumPlayers: number
    qualifyingTime: number
    turfOwner: string
    topDog: string
    baienabled: number
    baidefault: number
    bdamageenabled: number
    bdamagedefault: number
    btrafficenabled: number
    btrafficdefault: number
    bbackwardenabled: number
    bbackwarddefault: number
    bnightenabled: number
    bnightdefault: number
    bweatherenabled: number
    bweatherdefault: number
    bnumroundsenabled: number
    numroundsdefault: number
    numroundsmax: number
    numroundsmin: number
    bnumlapsenabled: number
    numlapsdefault: number
    numlapsmax: number
    numlapsmin: number
    bnumplayersenabled: number
    numplayersdefault: number
    numplayersmax: number
    numplayersmin: number
    linear: number
    gridSpreadFactor: number
    dragStagingSlice: number
    dragStageRight: number
    dragStageLeft: number
    endSlice: number
    startSlice: number
    turfLength: number
    elementId: number
    clientArt: string
    eTurfName: string
    NPSRiffName: string
    turfId: number
    racetypeId: number
    lobbyId: number
  }
  
  /** @type {ILobbyInfo} */
  const lobbyInfoDefaults: ILobbyInfo = {
    // DWORD    lobbyID;
    lobbyId: 0,
    // DWORD    raceTypeID;
    racetypeId: 0,
    // DWORD    turfID;
    turfId: 0,
  
    // Char NPSRiffName[MC_MAX_NPS_RIFF_NAME]; // 32
    NPSRiffName: 'main',
    // Char eTurfName[256];
    eTurfName: '',
    // Char clientArt[11];
    clientArt: '',
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
    topDog: '',
    // Char   turfOwner[MAX_CLUB_NAME_LENGTH+1]; = 33 (including the +1)
    turfOwner: '',
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
  }
  
  /**
   * @class
   * @property {ILobbyInfo} data
   */
  export class LobbyInfoPacket {
    data: ILobbyInfo
    /**
     *
     */
    constructor() {
      this.data = lobbyInfoDefaults
    }
  
    /**
     *
     * @return {Buffer}
     */
    toPacket(): Buffer {
      const lobbyPacket = Buffer.alloc(567)
  
      lobbyPacket.writeInt32LE(this.data.lobbyId, 0)
      lobbyPacket.writeInt32LE(this.data.racetypeId, 4)
      lobbyPacket.writeInt32LE(this.data.turfId, 8)
  
      lobbyPacket.write(this.data.NPSRiffName, 12, 32)
      // Char eTurfName[256];
      lobbyPacket.write(this.data.eTurfName, 44, 256)
      // Char clientArt[11];
      lobbyPacket.write(this.data.clientArt, 300, 11)
      // DWORD    elementID;
      lobbyPacket.writeInt32LE(this.data.elementId, 311)
      // DWORD    turfLength;
      lobbyPacket.writeInt32LE(this.data.turfLength, 315)
      // DWORD    startSlice;
      lobbyPacket.writeInt32LE(this.data.startSlice, 319)
      // DWORD    endSlice;
      lobbyPacket.writeInt32LE(this.data.endSlice, 323)
      // Float    dragStageLeft;
      lobbyPacket.writeInt32LE(this.data.dragStageLeft, 327)
      // Float    dragStageRight;
      lobbyPacket.writeInt32LE(this.data.dragStageRight, 331)
      // DWORD    dragStagingSlice;
      lobbyPacket.writeInt32LE(this.data.dragStagingSlice, 335)
      // Float    gridSpreadFactor;
      lobbyPacket.writeInt32LE(this.data.gridSpreadFactor, 339)
      // WORD    linear;
      lobbyPacket.writeInt16LE(this.data.linear, 341)
      // WORD    numplayersmin;
      lobbyPacket.writeInt16LE(this.data.numplayersmin, 343)
      // WORD    numplayersmax;
      lobbyPacket.writeInt16LE(this.data.numplayersmax, 345)
      // WORD    numplayersdefault;
      lobbyPacket.writeInt16LE(this.data.numplayersdefault, 347)
      // WORD    bnumplayersenabled;
      lobbyPacket.writeInt16LE(this.data.bnumplayersenabled, 349)
      // WORD    numlapsmin;
      lobbyPacket.writeInt16LE(this.data.numlapsmin, 351)
      // WORD    numlapsmax;
      lobbyPacket.writeInt16LE(this.data.numlapsmax, 353)
      // WORD    numlapsdefault;
      lobbyPacket.writeInt16LE(this.data.numlapsdefault, 355)
      // WORD    bnumlapsenabled;
      lobbyPacket.writeInt16LE(this.data.bnumlapsenabled, 357)
      // WORD    numroundsmin;
      lobbyPacket.writeInt16LE(this.data.numroundsmin, 359)
      // WORD    numroundsmax;
      lobbyPacket.writeInt16LE(this.data.numroundsmax, 361)
      // WORD    numroundsdefault;
      lobbyPacket.writeInt16LE(this.data.numroundsdefault, 363)
      // WORD    bnumroundsenabled;
      lobbyPacket.writeInt16LE(this.data.bnumroundsenabled, 365)
      // WORD    bweatherdefault;
      lobbyPacket.writeInt16LE(this.data.bweatherdefault, 367)
      // WORD    bweatherenabled;
      lobbyPacket.writeInt16LE(this.data.bweatherenabled, 367)
      // WORD    bnightdefault;
      lobbyPacket.writeInt16LE(this.data.bnightdefault, 369)
      // WORD    bnightenabled;
      lobbyPacket.writeInt16LE(this.data.bnightenabled, 371)
      // WORD    bbackwarddefault;
      lobbyPacket.writeInt16LE(this.data.bbackwarddefault, 373)
      // WORD    bbackwardenabled;
      lobbyPacket.writeInt16LE(this.data.bbackwardenabled, 375)
      // WORD    btrafficdefault;
      lobbyPacket.writeInt16LE(this.data.btrafficdefault, 379)
      // WORD    btrafficenabled;
      lobbyPacket.writeInt16LE(this.data.btrafficenabled, 381)
      // WORD    bdamagedefault;
      lobbyPacket.writeInt16LE(this.data.bdamagedefault, 383)
      // WORD    bdamageenabled;
      lobbyPacket.writeInt16LE(this.data.bdamageenabled, 385)
      // WORD    baidefault;
      lobbyPacket.writeInt16LE(this.data.baidefault, 387)
      // WORD    baienabled;
      lobbyPacket.writeInt16LE(this.data.baienabled, 389)
  
      // Char   topDog[MC_NAME_LENGTH]; = 13
      // Also used for TimeTrial's "Last Weeks Champion"?
      lobbyPacket.write(this.data.topDog, 391, 13)
      // Char   turfOwner[MAX_CLUB_NAME_LENGTH+1]; = 33 (including the +1)
      lobbyPacket.write(this.data.turfOwner, 404, 33)
      // DWORD  qualifyingTime;
      lobbyPacket.writeInt32LE(this.data.qualifyingTime, 437)
      // DWORD   clubNumPlayers;
      lobbyPacket.writeInt32LE(this.data.clubNumPlayers, 441)
      // DWORD   clubNumLaps;
      lobbyPacket.writeInt32LE(this.data.clubNumLaps, 445)
      // DWORD   clubNumRounds;
      lobbyPacket.writeInt32LE(this.data.clubNumRounds, 449)
      // WORD    clubNight;
      lobbyPacket.writeInt16LE(this.data.clubNight, 453)
      // WORD    clubWeather;
      lobbyPacket.writeInt16LE(this.data.clubWeather, 457)
      // WORD    clubBackwards;
      lobbyPacket.writeInt16LE(this.data.clubBackwards, 459)
      // DWORD  bestLapTime; // (64hz ticks)
      lobbyPacket.writeInt32LE(this.data.bestLapTime, 461)
      // DWORD  lobbyDifficulty;
      lobbyPacket.writeInt32LE(this.data.lobbyDifficulty, 465)
      // DWORD  ttPointForQualify;
      lobbyPacket.writeInt32LE(this.data.ttPointForQualify, 469)
      // DWORD  ttCashForQualify;
      lobbyPacket.writeInt32LE(this.data.ttCashForQualify, 471)
      // DWORD  ttPointBonusFasterIncs;
      lobbyPacket.writeInt32LE(this.data.ttPointBonusFasterIncs, 475)
      // DWORD  ttCashBonusFasterIncs;
      lobbyPacket.writeInt32LE(this.data.ttCashBonusFasterIncs, 479)
      // DWORD  ttTimeIncrements;
      lobbyPacket.writeInt32LE(this.data.ttTimeIncrements, 483)
      // DWORD  ttvictory_1st_points;
      lobbyPacket.writeInt32LE(this.data.ttvictory_1st_points, 487)
      // DWORD  ttvictory_1st_cash;
      lobbyPacket.writeInt32LE(this.data.ttvictory_1st_cash, 491)
      // DWORD  ttvictory_2nd_points;
      lobbyPacket.writeInt32LE(this.data.ttvictory_2nd_points, 495)
      // DWORD  ttvictory_2nd_cash;
      lobbyPacket.writeInt32LE(this.data.ttvictory_2nd_cash, 499)
      // DWORD  ttvictory_3rd_points;
      lobbyPacket.writeInt32LE(this.data.ttvictory_3rd_points, 503)
      // DWORD  ttvictory_3rd_cash;
      lobbyPacket.writeInt32LE(this.data.ttvictory_3rd_cash, 507)
      // WORD   minLevel;
      lobbyPacket.writeInt16LE(this.data.minLevel, 511)
      // DWORD  minResetSlice;
      lobbyPacket.writeInt32LE(this.data.minResetSlice, 513)
      // DWORD  maxResetSlice;
      lobbyPacket.writeInt32LE(this.data.maxResetSlice, 517)
      // WORD   newbieFlag;
      lobbyPacket.writeInt16LE(this.data.newbieFlag, 521)
      // WORD   driverHelmetFlag;
      lobbyPacket.writeInt16LE(this.data.driverHelmetFlag, 523)
      // WORD   clubNumPlayersMax;
      lobbyPacket.writeInt16LE(this.data.clubNumPlayersMax, 525)
      // WORD   clubNumPlayersMin;
      lobbyPacket.writeInt16LE(this.data.clubNumPlayersMin, 527)
      // WORD   clubNumPlayersDefault;
      lobbyPacket.writeInt16LE(this.data.clubNumPlayersDefault, 529)
      // WORD   numClubsMin;
      lobbyPacket.writeInt16LE(this.data.numClubsMin, 531)
      // Float  racePointsFactor;
      lobbyPacket.writeInt32LE(this.data.racePointsFactor, 533)
      // WORD   bodyClassMax;
      lobbyPacket.writeInt16LE(this.data.bodyClassMax, 537)
      // WORD   powerClassMax;
      lobbyPacket.writeInt16LE(this.data.powerClassMax, 539)
      // WORD   partPrizesMax;      // max allowed for this lobby
      lobbyPacket.writeInt16LE(this.data.partPrizesMax, 541)
      // WORD   partPrizesWon;      // current users prizes for this lobby
      lobbyPacket.writeInt16LE(this.data.partPrizesWon, 543)
      // DWORD  clubLogoID;         // Logo ID for Turf owner
      lobbyPacket.writeInt32LE(this.data.clubLogoId, 545)
      // WORD   bteamtrialweather;  // Team Trials Weather Flag
      lobbyPacket.writeInt16LE(this.data.bteamtrialweather, 551)
      // WORD   bteamtrialnight;    // Team Trials Night Flag
      lobbyPacket.writeInt16LE(this.data.bteamtrialnight, 553)
      // WORD   bteamtrialbackward; // Team Trials Backwards Flag
      lobbyPacket.writeInt16LE(this.data.bteamtrialbackward, 555)
      // WORD   teamtrialnumlaps;   // Team Trials Number of Laps
      lobbyPacket.writeInt16LE(this.data.teamtrialnumlaps, 557)
      // DWORD  teamtrialbaseTUP;   // Team Trials Base Time Under Par
      lobbyPacket.writeInt32LE(this.data.teamtrialbaseTUP, 559)
      // Float  raceCashFactor;
      lobbyPacket.writeInt32LE(this.data.raceCashFactor, 563)
  
      return lobbyPacket
    }
  }

  /**
 * Packet container for NPS messages
 * @module NPSMsg
 */

/**
 *
 * @global
 * @typedef {Object} INPSMsgJSON
 * @property {number} msgNo
 * @property {number | null} opCode
 * @property {number} msgLength
 * @property {number} msgVersion
 * @property {string} content
 * @property {string} contextId
 * @property {module:MessageNode.MESSAGE_DIRECTION} direction
 * @property {string | null } sessionkey
 * @property {string} rawBuffer
 */
export interface INPSMessageJSON {
    msgNo: number
    opCode: number | undefined
    msgLength: number
    msgVersion: number
    content: string
    contextId: string
    direction: EMessageDirection
    sessionkey: string | undefined
    rawBuffer: string
  }
  
  /*
      NPS messages are sent serialized in BE format
  */
  
  // WORD msgNo;    NPS message number
  
  /**
   * @class
   * @property {number} msgNo
   * @property {number} msgVersion
   * @property {number} reserved
   * @property {Buffer} content
   * @property {number} msgLength
   * @property {MESSAGE_DIRECTION} direction
   */
  export class NPSMessage {
    msgNo: number
    msgVersion: number
    reserved: number
    content: Buffer
    msgLength: number
    direction: EMessageDirection
    serviceName: string
    /**
     *
     * @param {module:MessageNode.MESSAGE_DIRECTION} direction - the direction of the message flow
     */
    constructor(direction: EMessageDirection) {
      this.msgNo = 0
      this.msgVersion = 0
      this.reserved = 0
      this.content = Buffer.from([0x01, 0x02, 0x03, 0x04])
      this.msgLength = this.content.length + 12
      this.direction = direction
      this.serviceName = 'mcoserver:NPSMsg'
    }
  
    /**
     *
     * @param {Buffer} buffer
     * @return {void}
     */
    setContent(buffer: Buffer): void {
      this.content = buffer
      this.msgLength = this.content.length + 12
    }
  
    /**
     *
     * @return {Buffer}
     */
    getContentAsBuffer(): Buffer {
      return this.content
    }
  
    /**
     *
     * @return {string}
     */
    getPacketAsString(): string {
      return this.serialize().toString('hex')
    }
  
    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer {
      try {
        const packet = Buffer.alloc(this.msgLength)
        packet.writeInt16BE(this.msgNo, 0)
        packet.writeInt16BE(this.msgLength, 2)
        if (this.msgLength > 4) {
          packet.writeInt16BE(this.msgVersion, 4)
          packet.writeInt16BE(this.reserved, 6)
        }
  
        if (this.msgLength > 8) {
          packet.writeInt32BE(this.msgLength, 8)
          this.content.copy(packet, 12)
        }
  
        return packet
      } catch (error) {
        if (error instanceof Error) {
          throw new TypeError(`[NPSMsg] Error in serialize(): ${error}`)
        }
  
        throw new Error('[NPSMsg] Error in serialize(), error unknown')
      }
    }
  
    /**
     *
     * @param {Buffer} packet
     * @return {NPSMsg}
     * @memberof NPSMsg
     */
    deserialize(packet: Buffer): NPSMessage {
      this.msgNo = packet.readInt16BE(0)
      this.msgLength = packet.readInt16BE(2)
      this.msgVersion = packet.readInt16BE(4)
      this.content = packet.slice(12)
      return this
    }
  
    /**
     *
     * @param {string} messageType
     * @return {void}
     */
    dumpPacketHeader(messageType: string): void {
      log(
        'info',
        `NPSMsg/${messageType},
        ${JSON.stringify({
          direction: this.direction,
          msgNo: this.msgNo.toString(16),
          msgVersion: this.msgVersion,
          msgLength: this.msgLength,
        })}`,
        { service: this.serviceName },
      )
    }
  
    /**
     * DumpPacket
     * @return {void}
     * @memberof NPSMsg
     */
    dumpPacket(): void {
      log(
        'debug',
        `NPSMsg/NPSMsg,
        ${JSON.stringify({
          direction: this.direction,
          msgNo: this.msgNo.toString(16),
          msgVersion: this.msgVersion,
          msgLength: this.msgLength,
          content: this.content.toString('hex'),
          serialized: this.serialize().toString('hex'),
        })}`,
        { service: this.serviceName },
      )
    }
  
    /**
     *
     * @return {INPSMsgJSON}
     */
    toJSON(): INPSMessageJSON {
      return {
        msgNo: this.msgNo,
        contextId: '',
        msgLength: this.msgLength,
        msgVersion: this.msgVersion,
        content: this.content.toString('hex'),
        direction: this.direction,
        rawBuffer: this.content.toString('hex'),
        opCode: 0,
        sessionkey: '',
      }
    }
  }

  /**
 * @module LoginMsg
 */

/**
 * @class
 * @property {number} newMsgNo
 * @property {number} toFrom
 * @property {number} appId
 * @property {number} customerId
 * @property {number} personaId
 * @property {number} lotOwnerId
 * @property {number} brandedPartId
 * @property {number} skinId
 * @property {string} personaName
 * @property {string} version
 * @property {Buffer} data
 * @property {Record<string, unknown>} struct
 */
export class LoginMessage {
    msgNo: number
    toFrom: number
    appId: number
    customerId: number
    personaId: number
    lotOwnerId: number
    brandedPartId: number
    skinId: number
    personaName: string
    version: string
    data: Buffer
    /**
     *
     * @param {Buffer} buffer
     */
    constructor(buffer: Buffer) {
      this.msgNo = 0
      this.toFrom = 0
      this.appId = 0
  
      // TODO: Why do I set these if I turn around and deserialize after?
      this.customerId = 0
      this.personaId = 0
      this.lotOwnerId = 0
      this.brandedPartId = 0
      this.skinId = 0
      this.personaName = 'NotAPerson'
      this.version = '0.0.0.0'
      this.data = buffer
  
      this.deserialize(buffer)
    }
  
    /**
     *
     * @param {Buffer} buffer
     * @return {void}
     */
    deserialize(buffer: Buffer): void {
      try {
        this.msgNo = buffer.readInt16LE(0)
      } catch (error) {
        if (error instanceof RangeError) {
          // This is likeley not an MCOTS packet, ignore
        } else if (error instanceof Error) {
          throw new TypeError(
            `[LoginMsg] Unable to read msgNo from ${buffer.toString(
              'hex',
            )}: ${error}`,
          )
        }
  
        throw new Error(
          `[LoginMsg] Unable to read msgNo from ${buffer.toString(
            'hex',
          )}, error unknown`,
        )
      }
  
      this.customerId = buffer.readInt32LE(2)
      this.personaId = buffer.readInt32LE(6)
  
      this.lotOwnerId = buffer.readInt32LE(10)
      this.brandedPartId = buffer.readInt32LE(14)
      this.skinId = buffer.readInt32LE(18)
      this.personaName = buffer.slice(22, 34).toString()
  
      this.version = buffer.slice(34).toString()
    }
  
    /**
     * DumpPacket
     * @return {void}
     */
    dumpPacket(): void {
      log(
        'debug',
        `LoginMsg',
        ${JSON.stringify({
          msgNo: this.msgNo.toString(),
          customerId: this.customerId.toString(),
          personaId: this.personaId.toString(),
          lotOwnerId: this.lotOwnerId,
          brandedPartId: this.brandedPartId,
          skinId: this.skinId,
          personaName: this.personaName,
          version: this.version,
        })}`,
        { service: 'mcoserver:LoginMsg' },
      )
    }
  }

  /**
 * @class
 * @property {number} msgNo
 * @property {number} noLobbies
 * @property {0 | 1} moreToCome
 * @property {LobbyInfoPacket} lobbyList
 * @property {number} dataLength
 * @property {Buffer} data
 */
export class LobbyMessage {
    msgNo: number
    noLobbies: number
    moreToCome: number
    lobbyList: LobbyInfoPacket
    dataLength: number
    data: Buffer
    serviceName: string
    /**
     *
     */
    constructor() {
      this.msgNo = 325
  
      this.noLobbies = 1
      this.moreToCome = 0
  
      this.lobbyList = new LobbyInfoPacket()
      // The expected length here is 572
      this.dataLength = this.lobbyList.toPacket().length + 5
  
      if (this.dataLength !== 572) {
        throw new Error(
          `Unexpected length of packet! Expected 572, recieved ${this.dataLength}`,
        )
      }
  
      this.data = Buffer.alloc(this.dataLength)
      this.data.writeInt16LE(this.msgNo, 0)
      this.data.writeInt16LE(this.noLobbies, 2)
      this.data.writeInt8(this.moreToCome, 4)
      this.lobbyList.toPacket().copy(this.data, 5)
      this.serviceName = 'mcoserver:LobbyMsg'
    }
  
    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer {
      return this.data
    }
  
    /**
     * DumpPacket
     * @return {void}
     */
    dumpPacket(): void {
      log(
        'debug',
        `LobbyMsg',
        ${JSON.stringify({
          msgNo: this.msgNo,
          dataLength: this.dataLength,
          packet: this.serialize().toString('hex'),
        })}`,
        { service: this.serviceName },
      )
    }
  }

  /**
 * Packet structure for communications with the game database
 * @module MessageNode
 */

/**
 * @typedef {'RECEIVED' | 'SENT'} MESSAGE_DIRECTION
 *
 */
export enum EMessageDirection {
    RECEIVED = 'received',
    SENT = 'sent',
  }
  
  /**
   * @class
   * @property {MESSAGE_DIRECTION} direction
   * @property {number} msgNo
   * @property {number} seq
   * @property {Buffer} data
   * @property {number} dataLength
   * @property {string} mcoSig
   * @property {number} toFrom
   * @property {number} appId
   */
  export class MessageNode {
    direction: EMessageDirection
    msgNo: number
    seq: number
    flags: number
    data: Buffer
    dataLength: number
    mcoSig: string
    toFrom: number
    appId: number
    /**
     *
     * @param {MESSAGE_DIRECTION} direction
     */
    constructor(direction: EMessageDirection) {
      this.direction = direction
      this.msgNo = 0
      this.seq = 999
      this.flags = 0
      this.data = Buffer.alloc(0)
      this.dataLength = 0
      this.mcoSig = 'NotAValue'
  
      this.toFrom = 0
      this.appId = 0
    }
  
    /**
     *
     * @param {Buffer} packet
     * @return {void}
     */
    deserialize(packet: Buffer): void {
      try {
        this.dataLength = packet.readInt16LE(0)
        this.mcoSig = packet.slice(2, 6).toString()
        this.seq = packet.readInt16LE(6)
        this.flags = packet.readInt8(10)
  
        // Data starts at offset 11
        this.data = packet.slice(11)
  
        // Set message number
  
        this.msgNo = this.data.readInt16LE(0)
      } catch (err) {
        const error = err as Error
        if (error.name.includes('RangeError')) {
          // This is likeley not an MCOTS packet, ignore
          throw new Error(
            `[MessageNode] Not long enough to deserialize, only ${packet.length} bytes long`,
          )
        } else {
          throw new Error(
            `[MessageNode] Unable to read msgNo from ${packet.toString(
              'hex',
            )}: ${error}`,
          )
        }
      }
    }
  
    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer {
      const packet = Buffer.alloc(this.dataLength + 2)
      packet.writeInt16LE(this.dataLength, 0)
      packet.write(this.mcoSig, 2)
      packet.writeInt16LE(this.seq, 6)
      packet.writeInt8(this.flags, 10)
      this.data.copy(packet, 11)
      return packet
    }
  
    /**
     *
     * @param {number} appId
     * @return {void}
     */
    setAppId(appId: number): void {
      this.appId = appId
    }
  
    /**
     *
     * @param {number} newMsgNo
     * @return {void}
     */
    setMsgNo(newMessageNo: number): void {
      this.msgNo = newMessageNo
      this.data.writeInt16LE(this.msgNo, 0)
    }
  
    /**
     *
     * @param {number} newSeq
     * @return {void}
     */
    setSeq(newSeq: number): void {
      this.seq = newSeq
    }
  
    /**
     *
     * @param {Buffer} packet
     * @return {void}
     */
    setMsgHeader(packet: Buffer): void {
      const header = Buffer.alloc(6)
      packet.copy(header, 0, 0, 6)
    }
  
    /**
     *
     * @param {Buffer} buffer
     * @return {void}
     */
    updateBuffer(buffer: Buffer): void {
      this.data = Buffer.from(buffer)
      this.dataLength = 10 + buffer.length
      this.msgNo = this.data.readInt16LE(0)
    }
  
    /**
     *
     * @return {boolean}
     */
    isMCOTS(): boolean {
      return this.mcoSig === 'TOMC'
    }
  
    /**
     *
     * @return {void}
     */
    dumpPacket(): void {
      let packetContentsArray = this.serialize().toString('hex').match(/../g)
      if (packetContentsArray === null) {
        packetContentsArray = []
      }
  
      log(
        'debug',
        `Message ${JSON.stringify({
          dataLength: this.dataLength,
          isMCOTS: this.isMCOTS(),
          msgNo: this.msgNo,
          direction: this.direction,
          seq: this.seq,
          flags: this.flags,
          toFrom: this.toFrom,
          appId: this.appId,
          packetContents: packetContentsArray.join('') || '',
        })}`,
        { service: 'mcoserver:MessageNode' },
      )
    }
  
    /**
     *
     * @return {number}
     */
    getLength(): number {
      return this.dataLength
    }
  
    /**
     *
     * @param {Buffer} packet
     * @return {void}
     */
    BaseMsgHeader(packet: Buffer): void {
      // WORD msgNo;
      this.msgNo = packet.readInt16LE(0)
    }
  }
  
  