/// <reference types="node" />
import { SerializedBuffer } from "@rustymotors/shared";
export declare class PartsAssemblyMessage extends SerializedBuffer {
    _msgNo: number;
    _ownerId: number;
    _numberOfParts: number;
    _partList: Part[];
    constructor(owerId: number);
    size(): number;
    serialize(): Buffer;
}
export declare class Part extends SerializedBuffer {
    _partId: number;
    _parentPartId: number;
    _brandedPartId: number;
    _repairPrice: number;
    _junkPrice: number;
    _wear: number;
    _attachmentPoint: number;
    _damage: number;
    _retailPrice: number;
    _maxWear: number;
    constructor();
    size(): number;
    serialize(): Buffer;
    toString(): string;
}
