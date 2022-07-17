import { MessageNode } from './MessageNode.js';
import { StockCar } from './StockCar.js';
import { IMessageNode } from './types.js';

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



export class StockCarInfoMessage extends MessageNode implements IMessageNode {
  msgNo;
  starterCash;
  dealerId;
  brand;
  noCars;
  moreToCome;
  /**
   *
   * @type {StockCar[]}
   * @memberof StockCarInfoMessage
   */
  StockCarList: StockCar[] = [];
  /**
   *
   *
   * @type {string}
   * @memberof StockCarInfoMessage
   */
  serviceName: string;
  /**
   * Creates an instance of StockCarInfoMsg.
   * @class
   * @param {number} starterCash
   * @param {number} dealerId
   * @param {number} brand
   * @memberof StockCarInfoMsg
   */
  constructor(starterCash: any, dealerId: any, brand: any) {
    super("sent");
    this.msgNo = 141;
    this.starterCash = starterCash;
    this.dealerId = dealerId;
    this.brand = brand;
    /** Number of cars */
    this.noCars = 1;
    /** @type {0|1} */
    this.moreToCome = 0;
    /** @type {module:StockCar} */
    this.StockCarList = [];
    this.serviceName = 'mcoserver:StockCarInfoMsg';
  }

  /**
   *
   * @param {StockCar} car
   * @return {void}
   */
  addStockCar(car: any): void {
    this.StockCarList.push(car);
    this.noCars = this.StockCarList.length;
  }

  /**
   *
   * @return {Buffer}
   */
  serialize(): Buffer {
    // This does not count the StockCar array
    const packet = Buffer.alloc((17 + 9) * this.StockCarList.length);
    packet.writeInt16LE(this.msgNo, 0);
    packet.writeInt32LE(this.starterCash, 2);
    packet.writeInt32LE(this.dealerId, 6);
    packet.writeInt32LE(this.brand, 10);
    packet.writeInt16LE(this.noCars, 14);
    packet.writeInt8(this.moreToCome, 16);
    if (this.StockCarList.length > 0) {
      for (let i = 0; i < this.StockCarList.length; i++) {
        const offset = 10 * i;
        const record = this.StockCarList[i];
        if (typeof record !== 'undefined') {
          record.serialize().copy(packet, 17 + offset);
        }
      }
    }

    return packet;
  }

  /**
   * DumpPacket
   * @return {string}
   */
  dumpPacket(): string {
    return `${JSON.stringify({
      msgNo: this.msgNo,
      starterCash: this.starterCash,
      dealerId: this.dealerId,
      brand: this.brand,
      noCars: this.noCars,
      moreToCome: this.moreToCome,
      stockCarList: this.StockCarList.toString()
    })}`;
  }
}
