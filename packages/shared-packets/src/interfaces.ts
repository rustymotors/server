export interface ISerializable {
    serialize(): Buffer;
    deserialize(data: Buffer): void;
    getByteSize(): number;
    toString(): string;
    toHexString(): string;
}

export interface IMessage extends ISerializable {
    header: ISerializable;
    getData(): ISerializable;
    getDataBuffer(): Buffer;
    setData(data: ISerializable): void;
    setDataBuffer(data: Buffer): void;
}
