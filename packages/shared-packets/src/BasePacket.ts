import type { ISerializable } from "./interfaces.js";

export class Serializable implements ISerializable {
    protected _data: Buffer = Buffer.alloc(0);

    protected _asHex(bytes: Buffer): string {
        return bytes.length % 2 === 0
            ? bytes.toString("hex")
            : bytes.toString("hex") + "0";
    }

    protected _assertEnoughData(data: Buffer, expected: number) {
        if (data.length < expected) {
            throw new Error(
                `Data is too short. Expected at least ${expected} bytes, got ${data.length} bytes`,
            );
        }
    }

    serialize(): Buffer {
        return this._data;
    }
    deserialize(data: Buffer): void {
        this._data = data;
    }
    getByteSize(): number {
        return this._data.length;
    }
    asHexString(): string {
        return this._asHex(this._data);
    }
}

export class BasePacket extends Serializable implements ISerializable {
    private header: ISerializable = new Serializable();

    override serialize(): Buffer {
        return Buffer.concat([this.header.serialize(), this._data]);
    }
    override deserialize(data: Buffer): void {
        this.header.deserialize(data);
        this._data = data.subarray(this.header.getByteSize());
    }
    override getByteSize(): number {
        return this.header.getByteSize() + this._data.length;
    }
    override asHexString(): string {
        return this.serialize().toString("hex");
    }
}
