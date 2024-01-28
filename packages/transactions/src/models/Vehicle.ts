import { DBModel } from "./index.js";

export class Vehicle implements DBModel {
    save(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    delete(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    private vehicleId = 0; // 4 bytes
    private skinId = 0; // 4 bytes
    private flags = 0; // 4 bytes
    private delta = 0; // 4 bytes
    private carClass = 0; // 1 byte
    private damageLength = 0; // 2 bytes
    private damage = 0; // 1 byte / max 2000
}