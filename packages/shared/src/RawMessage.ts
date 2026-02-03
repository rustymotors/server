import { checkSize4 } from "./helpers.js";
import { checkSize2 } from "./helpers.js";
import { sliceBuff } from "./helpers.js";
import type { NPSMessage } from "./types.js";


export class RawMessage implements NPSMessage {
	private _header: RawMessageHeader;
	private _data: Buffer;

	constructor() {
		this._header = new RawMessageHeader();
		this._data = Buffer.alloc(0);
	}

	get sizeOf() {
		return this._header.length ?? this._header.sizeOf + this._data.byteLength;
	}

	serialize() {
		return Buffer.from(Buffer.concat([
			this._header.serialize(),
			this._data
		]));
	}

	deserialize(buf: Buffer) {
		checkSize4(buf.byteLength);
		this._header.deserialize(sliceBuff(buf, 0, 4));
		if (buf.byteLength > 4) {
			this._data = Buffer.from(buf.subarray(4));
		}
	}

	get id() {
		return this._header.id;
	}

	set id(val: number) {
		checkSize2(val);
		this._header.id = val;
	}

	get length() {
		return this._header.length;
	}

	set length(val: number) {
		checkSize2(val);
		this._header.length = val;
	}

	set data(val: Buffer) {
		this._data = val
	}
}
export class RawMessageHeader implements NPSMessage {
	private _id: Buffer
	private _length: Buffer

	constructor() {
		this._id = Buffer.alloc(2)
		this._length = Buffer.alloc(2)
	}

	get sizeOf() {
		return 4
	}

	serialize() {
		return Buffer.from(Buffer.concat([
			this._id,
			this._length
		]))
	}

	deserialize(buf: Buffer) {
		if (buf.byteLength < 4) {
			throw new Error('Header must be 4 bytes long')
		}
		this._id = sliceBuff(buf, 0, 2)
		this._length = sliceBuff(buf, 2, 2)
	}

	get id() {
		return this._id.readInt16BE()
	}

	set id(val: number) {
		checkSize2(val)
		this._id.writeInt16BE(val)
	}

	get length() {
		return this._length.readInt16BE()
	}

	set length(val: number) {
		checkSize2(val)
		this._length.writeInt16BE(val)
	}
}

