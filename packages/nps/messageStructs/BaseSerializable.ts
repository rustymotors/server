import type { ISerializable } from "../types.js";

export class BaseSerializable implements ISerializable {
    serialize(): Buffer {
        throw new Error('Method not implemented.');
    }
    deserialize(_data: Buffer): void {
        throw new Error('Method not implemented.');
    }
    /** @deprecated use sizeOf() instead */
    getByteSize(): number {
        throw new Error('Method not implemented.');
    }
    get sizeOf(): number {
        throw new Error('Method not implemented.');
    }
    toString(): string {
        throw new Error('Method not implemented.');
    }
}
