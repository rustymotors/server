import type { DBModel } from "./index.js";

export class PartModel implements DBModel {
    private partId = 0; // 4 bytes
    private parentPartId = 0; // 4 bytes
    private brandedPartId = 0; // 4 bytes
    private repairCost = 0; // 4 bytes
    private junkPrice = 0; // 4 bytes
    private wear = 0; // 4 bytes
    private attachmentPoint = 0; // 1 byte
    private damage = 0; // 1 byte

    constructor() {}

    save(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    delete(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public size() {
        return 26;
    }

    public toBytes() {
        const buffer = Buffer.alloc(this.size());
        let offset = 0;
        buffer.writeUInt32LE(this.partId, offset);
        offset += 4;
        buffer.writeUInt32LE(this.parentPartId, offset);
        offset += 4;
        buffer.writeUInt32LE(this.brandedPartId, offset);
        offset += 4;
        buffer.writeUInt32LE(this.repairCost, offset);
        offset += 4;
        buffer.writeUInt32LE(this.junkPrice, offset);
        offset += 4;
        buffer.writeUInt32LE(this.wear, offset);
        offset += 4;
        buffer.writeUInt8(this.attachmentPoint, offset);
        offset += 1;
        buffer.writeUInt8(this.damage, offset);

        return buffer;
    }

    public toString() {
        return `Part:
        partId: ${this.partId}
        parentPartId: ${this.parentPartId}
        brandedPartId: ${this.brandedPartId}
        repairCost: ${this.repairCost}
        junkPrice: ${this.junkPrice}
        waer: ${this.wear}
        attachmentPoint: ${this.attachmentPoint}
        damage: ${this.damage}`;
    }

    public getPartId(): number {
        return this.partId;
    }

    public getParentPartId(): number {
        return this.parentPartId;
    }

    public getBrandedPartId(): number {
        return this.brandedPartId;
    }

    public getRepairCost(): number {
        return this.repairCost;
    }

    public getJunkPrice(): number {
        return this.junkPrice;
    }

    public getWear(): number {
        return this.wear;
    }

    public getAttachmentPoint(): number {
        return this.attachmentPoint;
    }

    public getDamage(): number {
        return this.damage;
    }

    public setPartId(partId: number) {
        this.partId = partId;
    }

    public setParentPartId(parentPartId: number) {
        this.parentPartId = parentPartId;
    }

    public setBrandedPartId(brandedPartId: number) {
        this.brandedPartId = brandedPartId;
    }

    public setRepairCost(repairCost: number) {
        this.repairCost = repairCost;
    }

    public setJunkPrice(junkPrice: number) {
        this.junkPrice = junkPrice;
    }

    public setWear(wear: number) {
        this.wear = wear;
    }

    public setAttachmentPoint(attachmentPoint: number) {
        this.attachmentPoint = attachmentPoint;
    }

    public setDamage(damage: number) {
        this.damage = damage;
    }
}
