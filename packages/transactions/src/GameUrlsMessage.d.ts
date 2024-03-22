/// <reference types="node" />
import { SerializedBuffer } from "@rustymotors/shared";
/**
 * A message listing the lobbies
 * This is the body of a MessageNode
 */
export declare class GameUrlsMessage extends SerializedBuffer {
    _msgNo: number;
    _urlCount: number;
    _shouldExpectMoreMessages: boolean;
    _urlList: GameUrl[];
    constructor();
    size(): number;
    /**
     * Add a lobby to the list
     * @param {GameUrl} lobby
     */
    addURL(lobby: GameUrl): void;
    serialize(): Buffer;
    toString(): string;
}
export declare class GameUrl extends SerializedBuffer {
    _urlId: number;
    urlRef: string;
    constructor();
    size(): number;
    serialize(): Buffer;
    toString(): string;
}
