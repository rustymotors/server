import type { SerializableInterface } from "./types.js";

export class BufferSerializer implements SerializableInterface {
	protected _data: Buffer = Buffer.alloc(4);

	protected _assertEnoughData(data: Buffer, expected: number) {
		if (data.length < expected) {
			throw RangeError(
				`Data is too short. Expected at least ${expected} bytes, got ${data.length} bytes`,
			);
		}
	}

	/**
	 * Serializes the current instance data into a Buffer.
	 *
	 * @returns {Buffer} The serialized data as a Buffer.
	 */
	serialize()  {
		return this._data;
	}

	/**
	 * Deserializes the given buffer data and assigns it to the internal `_data` property.
	 *
	 * @param data - The buffer containing the serialized data.
	 */
	deserialize(data: Buffer) {
		this._data = data;
	}

	_doDeserialize(buf: Buffer) {
		return this.deserialize(buf)
	}

	_doSerialize() {
		return this.serialize()
	}

	/**
	 * Calculates and returns the byte size of the data.
	 *
	 * @returns {number} The length of the data in bytes.
	 */
	getByteSize(): number {
		return this._data.length;
	}

	/**
	 * Converts the serialized data to a hexadecimal string.
	 *
	 * @returns {string} The hexadecimal representation of the serialized data.
	 * If the length of the hex string is odd, a leading zero is added to make it even.
	 */
	toHexString(): string {
		const hexString = this.serialize().toString("hex");
		return hexString.length % 2 === 0 ? hexString : `0${hexString}`;
	}
}
