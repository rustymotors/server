/// <reference types="node" />
import type { TPart } from "./Part.js";
export type TVehicle = {
    vehicleId: number;
    skinId: number;
    flags: number;
    class: number;
    infoSetting: number;
    damageInfo: Buffer | null;
};
export type VehiclePartTreeType = {
    vehicleId: number;
    skinId: number;
    flags: number;
    class: number;
    infoSetting: number;
    damageInfo: Buffer | null;
    isStock: boolean;
    ownedLotId: number | null;
    ownerID: number | null;
    partId: number;
    parentPartId: null;
    brandedPartId: number;
    partTree: {
        level1: {
            partId: number;
            parts: TPart[];
        };
        level2: {
            partId: number;
            parts: TPart[];
        };
    };
};
export declare function savePart(part: TPart): Promise<void>;
export declare function saveVehicle(
    vehiclePartTree: VehiclePartTreeType,
): Promise<void>;
export declare function saveVehiclePartTree(
    vehiclePartTree: VehiclePartTreeType,
): Promise<void>;
export declare function buildVehiclePartTreeFromDB(
    vehicleId: number,
): Promise<VehiclePartTreeType>;
export declare function buildVehiclePartTree({
    brandedPartId,
    skinId,
    ownedLotId,
    ownerID,
    isStock,
}: {
    brandedPartId: number;
    skinId: number;
    ownedLotId?: number;
    ownerID?: number;
    isStock: boolean;
}): Promise<VehiclePartTreeType>;
