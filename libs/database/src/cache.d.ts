import type { TBrand } from "./models/Brand.js";
import type { VehiclePartTreeType } from "./models/VehiclePartTree.js";
export declare function getBrand(
    brandName: string,
): Promise<TBrand | undefined>;
export declare function getVehiclePartTree(
    vehicleId: number,
): Promise<VehiclePartTreeType | undefined>;
export declare function setVehiclePartTree(
    vehicleId: number,
    vehiclePartTree: VehiclePartTreeType,
): Promise<void>;
