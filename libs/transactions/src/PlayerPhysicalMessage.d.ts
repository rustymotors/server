/// <reference types="node" />
import { SerializedBuffer } from "rusty-shared";
export declare class PlayerPhysicalMessage extends SerializedBuffer {
    _msgNo: number;
    _playerId: number;
    _bodytype: number;
    _hairColor: number;
    _skinColor: number;
    _shirtColor: number;
    _pantsColor: number;
    constructor();
    size(): number;
    serialize(): Buffer;
    deserialize(buffer: Buffer): void;
    toString(): string;
}
