/// <reference types="node" />
import { SerializedBuffer } from "rusty-shared";
import {
    PartStruct,
    VehicleStruct,
} from "../messageHandlers/_getCompleteVehicleInfo.js";
export declare class CarInfoMessage extends SerializedBuffer {
    msgNo: number;
    playerId: number;
    private vehicle;
    noOfParts: number;
    private parts;
    constructor();
    size(): number;
    getFirstPartSize(): number;
    serialize(): Buffer;
    toString(): string;
    setVehicle(vehicle: VehicleStruct): void;
    setParts(parts: PartStruct[]): void;
}
