export interface Message {
    toBytes(): Buffer;
    toString(): string;
    toHex(): string;
    setData(data: Buffer): void;
    getData(): Buffer;
    getSize(): number;
}
