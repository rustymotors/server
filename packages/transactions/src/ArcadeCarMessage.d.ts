/// <reference types="node" />
import { SerializedBuffer } from "@rustymotors/shared";
/**
 * A message listing the lobbies
 * This is the body of a MessageNode
 */
export declare class ArcadeCarMessage extends SerializedBuffer {
    _msgNo: number;
    _carCount: number;
    _shouldExpectMoreMessages: boolean;
    _carList: ArcadeCarInfo[];
    constructor();
    size(): number;
    /**
     * Add a lobby to the list
     * @param {ArcadeCarInfo} lobby
     */
    addCar(lobby: ArcadeCarInfo): void;
    serialize(): Buffer;
    toString(): string;
}
export declare class ArcadeCarInfo extends SerializedBuffer {
    _brandedPartId: number;
    _lobbyId: number;
    constructor();
    size(): number;
    serialize(): Buffer;
    toString(): string;
}
