import { SerializedBuffer } from "./messageFactory.js";

export class Timestamp extends SerializedBuffer {
    _year: number;
    _month: number;
    _day: number;
    _hour: number;
    _minute: number;
    _second: number;
    _fraction: number;
    constructor() {
        super();
        this._year = 0; // 2 bytes
        this._month = 0; // 2 bytes
        this._day = 0; // 2 bytes
        this._hour = 0; // 2 bytes
        this._minute = 0; // 2 bytes
        this._second = 0; // 2 bytes
        this._fraction = 0; // 2 bytes
        // total: 14 bytes
    }

    override size() {
        return 14;
    }

    override serialize() {
        const buffer = Buffer.alloc(this.size());
        let offset = 0;
        buffer.writeUInt16LE(this._year, offset);
        offset += 2;
        buffer.writeUInt16LE(this._month, offset);
        offset += 2;
        buffer.writeUInt16LE(this._day, offset);
        offset += 2;
        buffer.writeUInt16LE(this._hour, offset);
        offset += 2;
        buffer.writeUInt16LE(this._minute, offset);
        offset += 2;
        buffer.writeUInt16LE(this._second, offset);
        offset += 2;
        buffer.writeUInt8(this._fraction, offset);

        return buffer;
    }

    override toString() {
        return `TimeStamp: year=${this._year} month=${this._month} day=${this._day} hour=${this._hour} minute=${this._minute} second=${this._second} fraction=${this._fraction}`;
    }

    as64BitNumber() {
        const year = this._year * 100000000000000;
        const month = this._month * 1000000000000;
        const day = this._day * 10000000000;
        const hour = this._hour * 100000000;
        const minute = this._minute * 1000000;
        const second = this._second * 10000;
        const fraction = this._fraction;

        return year + month + day + hour + minute + second + fraction;
    }

    static now() {
        const now = new Date();
        const timestamp = new Timestamp();
        timestamp._year = now.getFullYear();
        timestamp._month = now.getMonth() + 1;
        timestamp._day = now.getDate();
        timestamp._hour = now.getHours();
        timestamp._minute = now.getMinutes();
        timestamp._second = now.getSeconds();
        timestamp._fraction = now.getMilliseconds();

        return timestamp;
    }
}
