/// <reference types="node" />
import { SerializedBuffer } from "../../shared";
/**
 * A message listing the player's owned vehicles
 * This is the body of a MessageNode
 */
export declare class OwnedVehiclesMessage extends SerializedBuffer {
    _msgNo: number;
    _numberOfVehicles: number;
    _vehicleList: OwnedVehicle[];
    constructor();
    size(): number;
    /**
     * Add a lobby to the list
     * @param {GameUrl} lobby
     */
    addVehicle(vehicle: OwnedVehicle): void;
    serialize(): Buffer;
    toString(): string;
}
export declare class OwnedVehicle extends SerializedBuffer {
    _vehicleId: number;
    _brandedPartId: number;
    constructor();
    size(): number;
    serialize(): Buffer;
    toString(): string;
}
