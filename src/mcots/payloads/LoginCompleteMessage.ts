import { getServerLogger } from "@rustymotors/shared";
import { ServerMessagePayload } from "@rustymotors/shared-packets";

const log = getServerLogger();

export class LoginCompleteMessage extends ServerMessagePayload {
  private _serverTime: number = 0; // 4 bytes
  private _firstTime: boolean = false; // 1 byte
  private _paycheckWaiting: boolean = false; // 1 byte
  private _clubInvitesWaiting: boolean = false; // 1 byte
  private tallyInProgress: boolean = false; // 1 byte
  private _secondsUntilShutdown: number = 0; // 2 bytes

  private _shardGNP: number = 0; // 4 bytes
  private _shardCarsSold: number = 0; // 4 bytes
  private _shardAverageSalaries: number = 0; // 4 bytes
  private _shardAverageCarsOwned: number = 0; // 4 bytes
  private _shardAverageLevel: number = 0; // 4 bytes

  private _cookie: number = 0; // 4 bytes

  private _nextTallyDate: number = 0; // 4 bytes
  private _nextPaycheckDate: number = 0; // 4 bytes

  constructor() {
    super();

    this._data = Buffer.alloc(this.getByteSize());
  }

  override getByteSize(): number {
    return 2 + 4 + 1 + 1 + 1 + 1 + 1 + 2 + 4 + 4 + 4 + 4 + 4 + 4 + 4 + 4;
  }

  override deserialize(data: Buffer): this {
    try {
      this._assertEnoughData(data, this.getByteSize());

      this.messageId = data.readUInt16LE(0);

      this._serverTime = data.readUInt32LE(2);

      this._firstTime = data.readUInt8(6) === 1;

      this._paycheckWaiting = data.readUInt8(7) === 1;

      this._clubInvitesWaiting = data.readUInt8(8) === 1;

      this.tallyInProgress = data.readUInt8(9) === 1;

      this._secondsUntilShutdown = data.readUInt16LE(10);

      this._shardGNP = data.readUInt32LE(12);

      this._shardCarsSold = data.readUInt32LE(16);

      this._shardAverageSalaries = data.readUInt32LE(20);

      this._shardAverageCarsOwned = data.readUInt32LE(24);

      this._shardAverageLevel = data.readUInt32LE(28);

      this._cookie = data.readUInt32LE(32);

      this._nextTallyDate = data.readUInt32LE(36);

      this._nextPaycheckDate = data.readUInt32LE(40);

      return this;
    } catch (error) {
      log.error(`Error deserializing LoginCompleteMessage: ${error as string}`);
      throw error;
    }
  }

  getServerTime() {
    return this._serverTime;
  }

  isFirstTime() {
    return this._firstTime;
  }

  isPaycheckWaiting() {
    return this._paycheckWaiting;
  }

  isClubInvitesWaiting() {
    return this._clubInvitesWaiting;
  }

  isTallyInProgress() {
    return this.tallyInProgress;
  }

  getSecondsUntilShutdown() {
    return this._secondsUntilShutdown;
  }

  getShardGNP() {
    return this._shardGNP;
  }

  getShardCarsSold() {
    return this._shardCarsSold;
  }

  getShardAverageSalaries() {
    return this._shardAverageSalaries;
  }

  getShardAverageCarsOwned() {
    return this._shardAverageCarsOwned;
  }

  getShardAverageLevel() {
    return this._shardAverageLevel;
  }

  getCookie() {
    return this._cookie;
  }

  getNextTallyDate() {
    return this._nextTallyDate;
  }

  getNextPaycheckDate() {
    return this._nextPaycheckDate;
  }

  override serialize(): Buffer {
    this._data.writeUInt16LE(this.messageId, 0);

    this._data.writeUInt32LE(this._serverTime, 2);

    this._data.writeUInt8(this._firstTime ? 1 : 0, 6);

    this._data.writeUInt8(this._paycheckWaiting ? 1 : 0, 7);

    this._data.writeUInt8(this._clubInvitesWaiting ? 1 : 0, 8);

    this._data.writeUInt8(this.tallyInProgress ? 1 : 0, 9);

    this._data.writeUInt16LE(this._secondsUntilShutdown, 10);

    this._data.writeUInt32LE(this._shardGNP, 12);

    this._data.writeUInt32LE(this._shardCarsSold, 16);

    this._data.writeUInt32LE(this._shardAverageSalaries, 20);

    this._data.writeUInt32LE(this._shardAverageCarsOwned, 24);

    this._data.writeUInt32LE(this._shardAverageLevel, 28);

    this._data.writeUInt32LE(this._cookie, 32);

    this._data.writeUInt32LE(this._nextTallyDate, 36);

    this._data.writeUInt32LE(this._nextPaycheckDate, 40);

    return this._data;
  }

  toString(): string {
    return `LoginCompleteMessage {serverTime: ${this._serverTime}, firstTime: ${this._firstTime}, paycheckWaiting: ${this._paycheckWaiting}, clubInvitesWaiting: ${this._clubInvitesWaiting}, tallyInProgress: ${this.tallyInProgress}, secondsUntilShutdown: ${this._secondsUntilShutdown}, shardGNP: ${this._shardGNP}, shardCarsSold: ${this._shardCarsSold}, shardAverageSalaries: ${this._shardAverageSalaries}, shardAverageCarsOwned: ${this._shardAverageCarsOwned}, shardAverageLevel: ${this._shardAverageLevel}, cookie: ${this._cookie}, nextTallyDate: ${this._nextTallyDate}, nextPaycheckDate: ${this._nextPaycheckDate}}`;
  }

  setServerTime(serverTime: number) {
    this._serverTime = serverTime;
  }

  setFirstTime(firstTime: boolean) {
    this._firstTime = firstTime;
  }

  setPaycheckWaiting(paycheckWaiting: boolean) {
    this._paycheckWaiting = paycheckWaiting;
  }

  setClubInvitesWaiting(clubInvitesWaiting: boolean) {
    this._clubInvitesWaiting = clubInvitesWaiting;
  }

  setTallyInProgress(tallyInProgress: boolean) {
    this.tallyInProgress = tallyInProgress;
  }

  setSecondsUntilShutdown(secondsUntilShutdown: number) {
    this._secondsUntilShutdown = secondsUntilShutdown;
  }

  setShardGNP(shardGNP: number) {
    this._shardGNP = shardGNP;
  }

  setShardCarsSold(shardCarsSold: number) {
    this._shardCarsSold = shardCarsSold;
  }

  setShardAverageSalaries(shardAverageSalaries: number) {
    this._shardAverageSalaries = shardAverageSalaries;
  }

  setShardAverageCarsOwned(shardAverageCarsOwned: number) {
    this._shardAverageCarsOwned = shardAverageCarsOwned;
  }

  setShardAverageLevel(shardAverageLevel: number) {
    this._shardAverageLevel = shardAverageLevel;
  }

  setCookie(cookie: number) {
    this._cookie = cookie;
  }

  setNextTallyDate(nextTallyDate: number) {
    this._nextTallyDate = nextTallyDate;
  }

  setNextPaycheckDate(nextPaycheckDate: number) {
    this._nextPaycheckDate = nextPaycheckDate;
  }

  size(): number {
    return this.getByteSize();
  }
}
