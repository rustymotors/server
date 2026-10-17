import { checkSize2 } from './helpers.js';
import { sliceBuff } from './helpers.js';
import type { NPSMessage } from './types.js';

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
