import { BytableMessage } from "@rustymotors/binary";

/**
 * A legacy message is an older nps message type. It has a 4 byte header.
 * This is a compatibility wrapper around BytableMessage (version 0 = 4-byte header).
 *
 * @deprecated Use BytableMessage directly instead
 */
export class LegacyMessage extends BytableMessage {
	constructor() {
		super(0); // Version 0 = 4-byte header (matches legacyHeader)
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
		// Update header length to include payload
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
		// Header length = header size (4) + payload size
		this.header.setMessageLength(4 + payloadSize);
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
			_size: 4,
			_doDeserialize: (buffer: Buffer) => {
				// Only deserialize the header (first 4 bytes), not the entire message
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

	asJSON() {
		return {
			header: {
				id: this.header.id,
				length: this.header.messageLength,
			},
			data: this.data.toString("hex"),
		};
	}

	override toString(): string {
		return `LegacyMessage: ${JSON.stringify({
			header: {
				id: this.header.id,
				length: this.header.messageLength,
			},
			data: this.data.toString("hex"),
		})}`;
	}

	toHexString(): string {
		return this.serialize().toString("hex");
	}
}