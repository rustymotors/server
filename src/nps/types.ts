export interface ISerializable {
    serialize(): Buffer;
    deserialize(data: Buffer): void;
    getByteSize(): number;
    toString(): string;
}

export interface IMessageHeader extends ISerializable {
    getVersion(): number;
    getId(): number;
    getLength(): number;
    getDataOffset(): number;
    setVersion(version: number): void;
    setId(id: number): void;
    setLength(length: number): void;
}

export interface IMessage extends ISerializable {
    header: IMessageHeader;
    getData(): ISerializable;
    getDataAsBuffer(): Buffer;
    setData(data: ISerializable): void;
}
