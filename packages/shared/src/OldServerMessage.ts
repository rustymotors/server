import type { IServerMessage } from "rusty-motors-protocol";
import { MessageNode } from "./MessageNode.js";
import { sliceBuff } from "./helpers.js";



/**
 * A server message is a message that is passed between the server and the client. It has an 11 byte header.
 * This is a compatibility wrapper around MessageNode.
 *
 * @deprecated Use MessageNode directly instead
 */
export class OldServerMessage extends MessageNode implements IServerMessage {
	private _headerProxy: any;

	/**
	 * @deprecated Use this.header or this.signature/this.length instead
	 */
	get _header() {
		if (!this._headerProxy) {
			const self = this;
			this._headerProxy = {
				get mcoSig() { return self.signature; },
			set mcoSig(val: string) { 
				(self as any).signature_ = val;
			},
				get length() { return self.length; },
				set length(val: number) { (self as any).msgLength_ = val; },
				get sequence() { return self.sequence; },
				set sequence(val: number) { self.sequence = val; },
				get flags() { return self.flags; },
				set flags(val: number) { 
					// MessageNode doesn't have a direct flags setter, so we access the protected field
					(self as any).flags_ = val; 
				},
				_size: 11,
				_doDeserialize: (buffer: Buffer) => {
					// Only deserialize the header (first 11 bytes), not the entire message
					// This prevents infinite recursion when subclasses call _header._doDeserialize()
					// This matches MessageNode.deserialize() header parsing (lines 80-86)
					let offset = 0;
					// Use unsigned 16-bit to match MessageNode and support messages larger than 32767 bytes
					(self as any).msgLength_ = buffer.readUInt16LE(offset);
					offset += 2;
					(self as any).signature_ = sliceBuff(buffer, offset, 4).toString('utf8');
					offset += 4;
					(self as any).sequence_ = buffer.readInt32LE(offset);
					offset += 4;
					(self as any).flags_ = buffer.readInt8(offset);
					return self._header;
				},
				_doSerialize: () => {
					return self.serialize().subarray(0, 11);
				},
			};
		}
		return this._headerProxy;
	}

	/**
	 * @deprecated Use this.msgNo instead
	 */
	get _msgNo() {
		return this.msgNo;
	}

	set _msgNo(val: number) {
		// Body is already initialized to 2 bytes minimum (smallest legal MessageNode size)
		this.msgNo = val;
	}

	constructor() {
		super();
		// Initialize with minimum legal body size
		// The smallest legal MessageNode is GenericRequestMessage which has:
		// - msgNo: 2 bytes
		// - data: 4 bytes
		// - data2: 4 bytes
		// Total: 10 bytes minimum body size
		// Note: setDataBuffer calls body.deserialize which requires at least 2 bytes,
		// so 10 bytes is safe
		this.setDataBuffer(Buffer.alloc(10));
	}

	size(): number {
		// 11 is the header size
		// Return header (11) + body size
		const bodySize = this.getBody().sizeOf;
		return 11 + bodySize;
	}

	/**
	 * @deprecated Use deserialize() instead
	 * @param {Buffer} buffer
	 * @returns {OldServerMessage}
	 */
	override _doDeserialize(buffer?: Buffer): void {
		if (buffer) this.deserialize(buffer);
	}

	/**
	 * @deprecated Use setBody() or setDataBuffer() instead
	 * @param {Buffer} buffer
	 */
	setBuffer(buffer: Buffer) {
		this.setDataBuffer(buffer);
	}

	/**
	 * @deprecated Use this.msgNo instead
	 */
	updateMsgNo() {
		// msgNo is already synced with body.msgNumber via MessageNode
	}

	override toString() {
		return `ServerMessage: ${JSON.stringify({
			header: {
				mcoSig: this.signature,
				length: this.length,
				sequence: this.sequence,
				flags: this.flags,
			},
			data: this.data.toString("hex"),
		})}`;
	}

	override toHexString() {
		return this.serialize().toString("hex");
	}

	override get sequenceNumber(): number {
		return this.sequence;
	}
}
