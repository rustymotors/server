import {
    OldServerMessage,
    serverHeader,
} from "../../../shared/messageFactory.js";

export class CarNumberSet {
    private cars: string[] = [];
    private carMax = 5;

    constructor(maxCars: number) {
        this.carMax = maxCars;
    }

    private isUniqueValue(value: string): boolean {
        return !this.cars.includes(value);
    }

    public getCarNumber(car: number): string {
        if (car > this.carMax) {
            throw new Error(
                `Car number ${car} is greater than max ${this.carMax}`,
            );
        }
        return this.cars[car] || "";
    }

    public setCarNumber(carNumber: number, car: string) {
        if (!this.isUniqueValue(car)) {
            throw new Error(`Car number ${car} is not unique`);
        }
        if (carNumber > this.carMax) {
            throw new Error(
                `Car number ${car} is greater than max ${this.carMax}`,
            );
        }
        this.cars[carNumber] = car;
    }

    public getCarCount(): number {
        return this.cars.length;
    }

    public size(): number {
        return this.carMax * 3;
    }

    public toBytes(): Buffer {
        const buffer = Buffer.alloc(this.size());
        let offset = 0;
        for (let i = 0; i < this.carMax; i++) {
            buffer.write(this.cars[i], offset);
            offset = i * 3;
        }
        return buffer;
    }

    public fromBytes(buffer: Buffer) {
        let offset = 0;
        for (let i = 0; i < this.carMax; i++) {
            this.cars[i] = buffer.toString("utf8", offset, offset + 3);
            offset = i * 3;
        }
    }

    public toString(): string {
        const carStrings = this.cars.map((car, index) => {
            return `Car ${index}: ${car}`;
        });
        return `CarNumberSet: 
            ${carStrings.join(", ")}`;
    }
}

export class PlayerOptionsMessage extends OldServerMessage {
    private plateType: number; // 2 bytes
    private plateText: string; // 8 bytes
    private carInfoSettings: number; // 4 bytes
    private carNumbers: CarNumberSet;

    constructor() {
        super();
        this._msgNo = 0;
        this.plateType = 0;
        this.plateText = "";
        this.carInfoSettings = 0;
        this.carNumbers = new CarNumberSet(6);
    }

    override size() {
        return 10;
    }

    public deserialize(buffer: Buffer) {
        let offset = 0;
        this._header._doDeserialize(buffer);
        offset += this._header._size;
        this._msgNo = buffer.readUInt16LE(offset);
        offset += 2;
        this.plateType = buffer.readUInt16LE(offset);
        offset += 2;
        this.plateText = buffer.toString("utf8", offset, offset + 8);
        offset += 8;
        this.carInfoSettings = buffer.readUInt32LE(offset);
        offset += 4;
        this.carNumbers.fromBytes(
            buffer.subarray(offset, offset + this.carNumbers.size()),
        );
    }

    public override toString(): string {
        return `PlayerOptionsMessage: 
            ${this._header.toString()}
            MsgNo: ${this._msgNo}
            PlateType: ${this.plateType}
            PlateText: ${this.plateText}
            CarInfoSettings: ${this.carInfoSettings}
            CarNumbers: ${this.carNumbers.toString()}`;
    }
}
