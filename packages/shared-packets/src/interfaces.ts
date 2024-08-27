export interface ISerializable {
	serialize(): Buffer;
	deserialize(data: Buffer): void;
	getByteSize(): number;
	toString(): string;
	toHexString(): string;
}

export interface IMessage extends ISerializable {
	header: ISerializable;
	getDataBuffer(): Buffer;
	setDataBuffer(data: Buffer): void;
}
