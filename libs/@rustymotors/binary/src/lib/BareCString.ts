import { BytableObject } from './types.js';

export class BareCString implements BytableObject {
    private _string: string = '';
    private _fixedLen: number;
    private _name: string = '';

    constructor(fixedLen = 0) {
        this._fixedLen = fixedLen;
    }

    get sizeOf(): number { return this._fixedLen; }
    get serializeSize(): number { return this._fixedLen; }

    get name(): string { return this._name; }
    setName(name: string): void { this._name = name; }

    get value(): Buffer { return this.serialize(); }
    setValue(value: string | number | Buffer): void {
        if (typeof value === 'string') {
            this.set(value);
        } else if (Buffer.isBuffer(value)) {
            this.deserialize(value);
        } else {
            throw new Error('BareCString.setValue: unsupported value type');
        }
    }

    get json(): Record<string, unknown> {
        return {
            name: this._name,
            serializeSize: this.serializeSize,
            value: this._string,
        };
    }

    set(val: string): void {
        if (this._fixedLen > 0 && val.length > this._fixedLen - 1) {
            throw new Error(
                `string can only be ${this._fixedLen - 1} bytes long, got ${val.length}`,
            );
        }
        this._string = val;
    }

    serialize(): Buffer {
        const buf = Buffer.alloc(this._fixedLen, 0);
        buf.write(this._string, 0, 'utf8');
        return buf;
    }

    deserialize(buf: Buffer): void {
        const slice = buf.subarray(0, this._fixedLen);
        const nullIdx = slice.indexOf(0);
        this._string = (nullIdx === -1 ? slice : slice.subarray(0, nullIdx)).toString('utf8');
    }

    toString(): string {
        return this._string;
    }
}
