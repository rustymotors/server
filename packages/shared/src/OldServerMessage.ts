import { IServerMessage } from "rusty-motors-protocol";
import { BytableBuffer } from "@rustymotors/binary";
import { serverHeader } from "./serverHeader.js";



/**
 * A server message is a message that is passed between the server and the client. It has an 11 byte header. @see {@link serverHeader}
 *
 * @deprecated
 */
export class OldServerMessage extends BytableBuffer implements IServerMessage {
	_header: serverHeader;
	_msgNo: number;
	constructor() {
		super();
		this._header = new serverHeader();
		this._msgNo = 0; // 2 bytes
		// Initialize with empty buffer (header only, no data)
		this.setValue(Buffer.alloc(0));
	}

	override size(): number {
		return this._header.length + this.value.length;
	}

	/**
	 * @deprecated
	 * @param {Buffer} buffer
	 * @returns {OldServerMessage}
	 */
	_doDeserialize(buffer: Buffer): OldServerMessage {
		this._header._doDeserialize(buffer);
		this.setValue(buffer.subarray(this._header._size));
		if (this.value.length >= 2) {
			this._msgNo = this.value.readUInt16LE(0);
		}
		return this;
	}

	/**
	 * Serializes the current message into a buffer.
	 * 
	 * This method allocates a new buffer with a size equal to the sum of the header length and 2 bytes.
	 * It then serializes the header and data into this buffer.
	 * 
	 * @returns {Buffer} The serialized buffer containing the header and data.
	 */
	override serialize() {
		// Ensure value includes msgNo if it's not already set
		let dataBuffer = this.value;
		if (dataBuffer.length < 2 && this._msgNo !== 0) {
			dataBuffer = Buffer.alloc(2);
			dataBuffer.writeUInt16LE(this._msgNo, 0);
		} else if (dataBuffer.length >= 2) {
			// Update msgNo in the buffer
			dataBuffer.writeUInt16LE(this._msgNo, 0);
		}
		
		const buffer = Buffer.alloc(this._header.length + dataBuffer.length);
		this._header._doSerialize().copy(buffer);
		dataBuffer.copy(buffer, this._header._size);
		return buffer;
	}

	/**
	 * @deprecated
	 * @param {Buffer} buffer
	 */
	setBuffer(buffer: Buffer) {
		super.setValue(buffer);
		this._header.length = buffer.length + this._header._size - 2;
	}

	/**
	 * @deprecated
	 */
	updateMsgNo() {
		this._msgNo = this.value.readUInt16LE(0);
	}

	override toString() {
		return `ServerMessage: ${JSON.stringify({
			header: this._header.toString(),
			data: this.value.toString("hex"),
		})}`;
	}

	override toHexString() {
		return this.serialize().toString("hex");
	}

	get sequenceNumber(): number {
		return this._header.sequence;
	}
}
