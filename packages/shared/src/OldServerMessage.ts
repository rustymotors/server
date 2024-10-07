import { SerializedBufferOld } from "./SerializedBufferOld.js";
import { serverHeader } from "./serverHeader.js";

/**
 * A server message is a message that is passed between the server and the client. It has an 11 byte header. @see {@link serverHeader}
 *
 * @mixin {SerializableMixin}
 */

export class OldServerMessage extends SerializedBufferOld {
	_header: serverHeader;
	_msgNo: number;
	constructor() {
		super();
		this._header = new serverHeader();
		this._msgNo = 0; // 2 bytes
	}

	override size(): number {
		return this._header.length + this.data.length;
	}

	/**
	 * @param {Buffer} buffer
	 * @returns {OldServerMessage}
	 */
	override _doDeserialize(buffer: Buffer): OldServerMessage {
		this._header._doDeserialize(buffer);
		this.setBuffer(buffer.subarray(this._header._size));
		if (this.data.length > 2) {
			this._msgNo = this.data.readInt16LE(0);
		}
		return this;
	}

	override serialize() {
		const buffer = Buffer.alloc(this._header.length + 2);
		this._header._doSerialize().copy(buffer);
		this.data.copy(buffer, this._header._size);
		return buffer;
	}

	/**
	 * @param {Buffer} buffer
	 */
	override setBuffer(buffer: Buffer) {
		super.setBuffer(buffer);
		this._header.length = buffer.length + this._header._size - 2;
	}

	updateMsgNo() {
		this._msgNo = this.data.readInt16LE(0);
	}

	override toString() {
		return `ServerMessage: ${JSON.stringify({
			header: this._header.toString(),
			data: this.data.toString("hex"),
		})}`;
	}

	toHexString() {
		return this.serialize().toString("hex");
	}
}
