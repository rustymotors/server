import type { DBModel } from "./index.js";
export declare class VehicleModel implements DBModel {
    private vehicleId;
    private skinId;
    private flags;
    private delta;
    private carClass;
    private damageLength;
    private damage;
    constructor(vehicleId: number);
    save(): Promise<void>;
    delete(): Promise<void>;
    getVehicleId(): number;
    getSkinId(): number;
    getFlags(): number;
    getDelta(): number;
    getCarClass(): number;
    getDamageLength(): number;
    getDamage(): number;
    setSkinId(skinId: number): void;
    setFlags(flags: number): void;
    setDelta(delta: number): void;
    setCarClass(carClass: number): void;
    setDamageLength(damageLength: number): void;
}
