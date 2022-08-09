// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

/**
 * @classdesc Helper class for a single 8-bit number
 */
export class Byte {
    private byte_ = Buffer.alloc(1);
    private _maxSize = 255;

    private constructor(x: number) {
        this.checkSize(x);
    }

    private checkSize(x: number) {
        if (x < 0 || x > this._maxSize) {
            throw new RangeError(
                `value must be between 0 and ${this._maxSize}`
            );
        }
    }

    static from(x: number): Byte {
        const byte = new Byte(x);
        byte.byte_[0] = x;
        return byte;
    }

    asNumber(): number {
        return Number(this.byte_);
    }

    asByte8(): Buffer {
        const b = Buffer.alloc(1);
        b.writeInt8(this.asNumber());
        return b;
    }
}

/**
 * @classdesc Helper class for a single 16-bit number
 */
export class Word {
    private _word: Buffer = Buffer.from([0x00, 0x00]);
    private _maxSize = 65535;

    private constructor(x: number) {
        this.checkSize(x);
    }

    private checkSize(x: number) {
        if (x < 0 || x > this._maxSize) {
            throw new RangeError(
                `value must be between 0 and ${this._maxSize}`
            );
        }
    }

    static from(x: number): Word {
        const word = new Word(x);
        console.log(x);
        word._word[0] = x & 0xff;
        word._word[1] = (x >>> 8) & 0xff;
        console.log(`0: ${word._word[0]}`);
        console.log(`1: ${word._word[1]}`);
        return word;
    }

    asNumber(): number {
        const n = ((this._word[1] as number) << 8) + (this._word[0] as number);
        return n;
    }

    asByte16(): Buffer {
        const b = Buffer.alloc(2);
        b.writeUInt16LE(this.asNumber());
        return b;
    }
}

/**
 * @classdesc Helper class for a single 32-bit number
 */
export class DWord {
    private _dword: Buffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
    private _maxSize = 4294967295;

    private constructor(x: number) {
        this.checkSize(x);
    }

    private checkSize(x: number) {
        if (x < 0 || x > this._maxSize) {
            throw new RangeError(
                `value must be between 0 and ${this._maxSize}`
            );
        }
    }

    static from(x: number): DWord {
        const dword = new DWord(x);
        console.log(x);
        dword._dword[0] = x & 0xffff;
        dword._dword[1] = (x >>> 8) & 0xffff;
        dword._dword[2] = (x >>> 16) & 0xffff;
        dword._dword[3] = (x >>> 24) & 0xffff;
        console.log(`0: ${dword._dword[0]}`);
        console.log(`1: ${dword._dword[1]}`);
        console.log(`2: ${dword._dword[2]}`);
        console.log(`3: ${dword._dword[3]}`);
        return dword;
    }

    asNumber(): number {
        const n =
            ((this._dword[3] as number) << 24) +
            ((this._dword[2] as number) << 16) +
            ((this._dword[1] as number) << 8) +
            (this._dword[0] as number);
        return n;
    }

    asByte32(): Buffer {
        const b = Buffer.alloc(4);
        b.writeUInt32LE(this.asNumber());
        return b;
    }
}

/**
 * @classdesc A base class to create serializable classes from
 * @version 1.0.0
 */
export abstract class SerializeBase {
    protected serializedBuffer_: Buffer = Buffer.alloc(0);

    /**
     * @api
     * @param {Buffer} buf
     * @returns {<T extends SerializeBase>}
     */
    deserialize(buf: Buffer): this {
        return this.doDeserialize_(buf);
    }

    /**
     * @abstract
     * @param {Buffer} buf
     */
    protected abstract doDeserialize_(buf: Buffer): this;

    serialize(): Buffer {
        return this.doSerialize_();
    }

    /**
     * @desc Override this method to call the different methods that
     *     serialize your properties
     * @example
     * doSerialize_() {
     *      _serializeBool(this.isTrue)
     *      _serializeString(this.name)
     * }
     * @returns {Buffer} The class properties, serialized as a bytestream
     */
    protected doSerialize_(): Buffer {
        return this.serializedBuffer_;
    }

    protected _serializeBool(b: boolean): void {
        const bool = b ? Buffer.from([0x01]) : Buffer.from([0x00]);
        this.serializedBuffer_ = Buffer.concat([this.serializedBuffer_, bool]);
    }

    /**
     * @desc Serialize an 8-bit number.
     *     You should not need to override this methood
     * @param n
     */
    protected serialize8_(n: number): void {
        const byte = Byte.from(n);
        this.serializedBuffer_ = Buffer.concat([
            this.serializedBuffer_,
            byte.asByte8(),
        ]);
    }

    /**
     * @desc Serialize a 16-bit number.
     *     You should not need to override this methood
     * @param n
     */
    protected serialize16_(n: number): void {
        const byte = Word.from(n);
        this.serializedBuffer_ = Buffer.concat([
            this.serializedBuffer_,
            byte.asByte16(),
        ]);
    }

    /**
     * @desc Serialize a 32-bit number.
     *     You should not need to override this methood
     * @param n
     */
    protected serialize32_(n: number): void {
        const dword = DWord.from(n);
        this.serializedBuffer_ = Buffer.concat([
            this.serializedBuffer_,
            dword.asByte32(),
        ]);
    }

    /**
     * @desc Serialize a string.
     *     You should not need to override this methood
     * @param {string} s
     * @param {boolean=} addNull Should a null be added to the end
     */
    protected serializeString_(
        s: string,
        addNull: boolean | undefined = false
    ): void {
        const ending = addNull ? Buffer.from([0x00]) : Buffer.alloc(0);
        const sBytes = Buffer.from(s);
        this.serializedBuffer_ = Buffer.concat([
            this.serializedBuffer_,
            sBytes,
            ending,
        ]);
    }

    protected serializeBlob_(buf: Buffer) {
        this.serializedBuffer_ = Buffer.concat([this.serializedBuffer_, buf]);
    }
}

const b = Word.from(9230);
console.log(b.asNumber());

const d = DWord.from(142893037);
console.log(d.asNumber());
