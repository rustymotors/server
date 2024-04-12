/// <reference types="node" />
import { SerializedBuffer } from "rusty-shared";
/**
 * A message listing the entry fees and purses for each entry fee
 * This is the body of a MessageNode
 */
export declare class EntryFeePurseMessage extends SerializedBuffer {
    _msgNo: number;
    _numberOfPurseEntries: number;
    _shouldExpectMoreMessages: boolean;
    _purseEntries: PurseEntry[];
    constructor();
    size(): number;
    /**
     * Add a lobby to the list
     * @param {PurseEntry} lobby
     */
    addEntry(purseEntry: PurseEntry): void;
    serialize(): Buffer;
    toString(): string;
}
export declare class PurseEntry extends SerializedBuffer {
    _entryFee: number;
    _purse: number;
    constructor();
    size(): number;
    /**
     * Deserialize the data
     *
     * @param {Buffer} data
     */
    deserialize(data: Buffer): this;
    serialize(): Buffer;
    toString(): string;
}
