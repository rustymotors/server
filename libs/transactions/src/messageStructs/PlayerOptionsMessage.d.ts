/// <reference types="node" />
import { OldServerMessage } from "rusty-shared";
export declare class CarNumberSet {
    private cars;
    private carMax;
    constructor(maxCars: number);
    private isUniqueValue;
    getCarNumber(car: number): string;
    setCarNumber(carNumber: number, car: string): void;
    getCarCount(): number;
    size(): number;
    toBytes(): Buffer;
    fromBytes(buffer: Buffer): void;
    toString(): string;
}
export declare class PlayerOptionsMessage extends OldServerMessage {
    private plateType;
    private plateText;
    private carInfoSettings;
    private carNumbers;
    constructor();
    size(): number;
    deserialize(buffer: Buffer): void;
    toString(): string;
}
