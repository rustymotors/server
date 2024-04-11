import type { DBModel } from "./index.js";

export class VehicleModel implements DBModel {
    private vehicleId = 0; // 4 bytes
    private skinId = 0; // 4 bytes
    private flags = 0; // 4 bytes
    private delta = 0; // 4 bytes
    private carClass = 0; // 1 byte
    private damageLength = 0; // 2 bytes
    private damage = 0; // 1 byte / max 2000

    constructor(vehicleId: number) {
        this.vehicleId = vehicleId;
    }

    save(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    delete(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    getVehicleId(): number {
        return this.vehicleId;
    }

    getSkinId(): number {
        return this.skinId;
    }

    getFlags(): number {
        return this.flags;
    }

    getDelta(): number {
        return this.delta;
    }

    getCarClass(): number {
        return this.carClass;
    }

    getDamageLength(): number {
        return this.damageLength;
    }

    getDamage(): number {
        return this.damage;
    }

    setSkinId(skinId: number): void {
        this.skinId = skinId;
    }

    setFlags(flags: number): void {
        this.flags = flags;
    }

    setDelta(delta: number): void {
        this.delta = delta;
    }

    setCarClass(carClass: number): void {
        this.carClass = carClass;
    }

    setDamageLength(damageLength: number): void {
        this.damageLength = damageLength;
    }
}
