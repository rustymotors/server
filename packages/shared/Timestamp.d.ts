/// <reference types="node" />
import { SerializedBuffer } from "./messageFactory.js";
export declare class Timestamp extends SerializedBuffer {
    _year: number;
    _month: number;
    _day: number;
    _hour: number;
    _minute: number;
    _second: number;
    _fraction: number;
    constructor();
    size(): number;
    serialize(): Buffer;
    toString(): string;
    as64BitNumber(): number;
    static now(): Timestamp;
}
