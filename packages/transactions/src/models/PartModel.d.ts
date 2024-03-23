/// <reference types="node" />
import type { DBModel } from "./index.js";
export declare class PartModel implements DBModel {
    private partId;
    private parentPartId;
    private brandedPartId;
    private repairCost;
    private junkPrice;
    private wear;
    private attachmentPoint;
    private damage;
    constructor();
    save(): Promise<void>;
    delete(): Promise<void>;
    size(): number;
    toBytes(): Buffer;
    toString(): string;
    getPartId(): number;
    getParentPartId(): number;
    getBrandedPartId(): number;
    getRepairCost(): number;
    getJunkPrice(): number;
    getWear(): number;
    getAttachmentPoint(): number;
    getDamage(): number;
    setPartId(partId: number): void;
    setParentPartId(parentPartId: number): void;
    setBrandedPartId(brandedPartId: number): void;
    setRepairCost(repairCost: number): void;
    setJunkPrice(junkPrice: number): void;
    setWear(wear: number): void;
    setAttachmentPoint(attachmentPoint: number): void;
    setDamage(damage: number): void;
}
