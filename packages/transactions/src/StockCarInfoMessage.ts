/**
 * Object for providing information on stock cars
 */
// WORD     msgNo;
// DWORD    starterCash;
// DWORD    dealerID;
// DWORD    brand;
// WORD     noCars;
// BYTE     moreToCome;
// StockCar carInfo[1];

type StockCar = import("./StockCar.js").StockCar;

export class StockCarInfoMessage {
	msgNo: number;
	starterCash: number;
	dealerId: number;
	brand: number;
	noCars: number;
	moreToCome: boolean;
	StockCarList: StockCar[];

	constructor(starterCash: number, dealerId: number, brand: number) {
		this.msgNo = 141;
		this.starterCash = starterCash;
		this.dealerId = dealerId;
		this.brand = brand;
		this.noCars = 0;
		this.moreToCome = false;
		this.StockCarList = [];
	}

	addStockCar(car: StockCar) {
		this.StockCarList.push(car);
		this.noCars = this.StockCarList.length;
	}

	serialize(): Buffer {
		const packet = Buffer.alloc((17 + 9) * this.StockCarList.length);
		packet.writeUInt16LE(this.msgNo, 0);
		packet.writeInt32LE(this.starterCash, 2);
		packet.writeInt32LE(this.dealerId, 6);
		packet.writeInt32LE(this.brand, 10);
		packet.writeUInt16LE(this.noCars, 14);
		packet.writeInt8(this.moreToCome ? 1 : 0, 16);
		if (this.StockCarList.length > 0) {
			for (let i = 0; i < this.StockCarList.length; i++) {
				const offset = 10 * i;
				const record = this.StockCarList[i];
				if (typeof record !== "undefined") {
					record.serialize().copy(packet, 17 + offset);
				}
			}
		}
		return packet;
	}

	toString() {
		return `${JSON.stringify({
			msgNo: this.msgNo,
			starterCash: this.starterCash,
			dealerId: this.dealerId,
			brand: this.brand,
			noCars: this.noCars,
			moreToCome: this.moreToCome,
			stockCarList: this.StockCarList.toString(),
		})}`;
	}
}
