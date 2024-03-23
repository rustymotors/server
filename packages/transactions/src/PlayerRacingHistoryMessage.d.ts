/// <reference types="node" />
import { SerializedBuffer } from "../../shared";
export declare class PlayerRacingHistoryMessage extends SerializedBuffer {
    _msgId: number;
    _userId: number;
    _numRaces: number;
    _expectMore: boolean;
    _raceHistoryRecords: RacingHistoryRecordEntry[];
    constructor();
    size(): number;
    addRecord(record: RacingHistoryRecordEntry): void;
    deserialize(buffer: Buffer): PlayerRacingHistoryMessage;
    serialize(): Buffer;
    asString(): string;
}
export declare class RacingHistoryRecordEntry extends SerializedBuffer {
    raceType: number;
    numberOfRacesEntered: number;
    numberOfRacesFinished: number;
    numberOfRacesWon: number;
    numberOfCarsWon: number;
    numberOfCarsLost: number;
    numberOfChampionshipsWon: number;
    cashWon: number;
    constructor();
    size(): number;
    serialize(): Buffer;
    deserialize(buffer: Buffer): RacingHistoryRecordEntry;
    asString(): string;
}
