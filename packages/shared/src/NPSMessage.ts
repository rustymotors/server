import { BytableMessage } from "@rustymotors/binary";

/**
 * A NPS message is a message that matches version 1.1 of the nps protocol. It has a 12 byte header.
 * This is a compatibility wrapper around BytableMessage (version 1 = 12-byte header).
 *
 * @deprecated Use BytableMessage directly instead
 */
export class NPSMessage extends BytableMessage {
	constructor() {
		super(1); // Version 1 = 12-byte header (matches NPSHeader)
	}

	/**
	 * Get the message ID from the header
	 */
	getMessageId(): number {
		return this.header.id;
	}

	/**
	 * Set the message ID in the header
	 */
	setMessageId(id: number): void {
		this.header.setId(id);
		this.updateHeaderLength();
	}

	/**
	 * Set the buffer (payload data)
	 * @deprecated Use this.data = buffer instead
	 */
	setBuffer(buffer: Buffer): void {
		this.data = buffer;
		this.updateHeaderLength();
	}

	/**
	 * Update the header length to match header size + payload size
	 */
	private updateHeaderLength(): void {
		const payloadSize = this.data.length;
		// Header length = header size (12) + payload size
		this.header.setMessageLength(12 + payloadSize);
	}

	/**
	 * Deserialize from buffer
	 */
	override deserialize(buffer: Buffer): this {
		super.deserialize(buffer);
		return this;
	}

	/**
	 * Serialize to buffer
	 */
	override serialize(): Buffer {
		// Update header length before serializing
		this.updateHeaderLength();
		return super.serialize();
	}

	/**
	 * @deprecated Use deserialize() instead
	 */
	_doDeserialize(buffer: Buffer): this {
		return this.deserialize(buffer);
	}

	/**
	 * @deprecated Use serialize() instead
	 */
	_doSerialize(): Buffer {
		return this.serialize();
	}

	/**
	 * Get header object (for compatibility)
	 * @deprecated Use this.header directly instead
	 */
	get _header() {
		const self = this;
		return {
			get id() { return self.header.id; },
			set id(val: number) { self.header.setId(val); self.updateHeaderLength(); },
			get length() { return self.header.messageLength; },
			set length(val: number) { self.header.setMessageLength(val); },
			get version() { return self.header.messageVersion === 1 ? 257 : 0; },
			set version(val: number) { self.header.setMessageVersion(val === 257 ? 1 : 0); },
			get reserved() { return self.header.reserved; },
			set reserved(val: number) { self.header.setReserved(val); },
			get checksum() { return self.header.checksum; },
			set checksum(val: number) { self.header.setChecksum(val); },
			_size: 12,
			_doDeserialize: (buffer: Buffer) => {
				// Only deserialize the header (first 12 bytes), not the entire message
				// This prevents infinite recursion when subclasses call _header._doDeserialize()
				self.header.deserialize(buffer);
				return self._header;
			},
			_doSerialize: () => {
				// Return just the header portion
				return self.header.serialize();
			},
			toString: () => {
				return self.header.toString();
			},
		};
	}

	size(): number {
		return this.header.messageLength;
	}

	override toString(): string {
		return `NPSMessage: ${JSON.stringify({
			header: {
				id: this.header.id,
				length: this.header.messageLength,
				version: this.header.messageVersion === 1 ? 257 : 0,
				reserved: this.header.reserved,
				checksum: this.header.checksum,
			},
			data: this.data.toString("hex"),
		})}`;
	}
}
