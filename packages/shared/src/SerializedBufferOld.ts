import type { SerializableInterface } from "rusty-motors-protocol";
import { SerializableMixin, AbstractSerializable } from "./messageFactory.js";

/**
 * A raw message is a message that is not parsed into a specific type.
 * It has no header, and is just a serialized buffer.
 *
 * @mixin {SerializableMixin}
 */

export class SerializedBufferOld extends SerializableMixin(
	AbstractSerializable, 
) implements SerializableInterface {
	constructor() {
		super();
	}

	deserialize(data: Buffer): this {
		this.setBuffer(data);		
		return this;
	}

	serialize() {
		return this.data;
	}

	override _doDeserialize(_buffer: Buffer): AbstractSerializable {
		return this.deserialize(_buffer)
	}

	override _doSerialize(): void {
		this.serialize()
	}

	override toString() {
		return `SerializedBuffer: ${this.serialize().toString("hex")}`;
	}

	size() {
		return this.data.length;
	}

	getByteSize() {
		return this.size();
	}

	toHexString() {
		return this.data.toString("hex");
	}
}