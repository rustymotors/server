import { DBModel } from "./index.js";

export class Part implements DBModel {
    private partId = 0; // 4 bytes
    private parentPartId = 0; // 4 bytes
    private brandedPartId = 0; // 4 bytes
    private repairCost = 0; // 4 bytes
    private junkPrice = 0; // 4 bytes
    private waer = 0; // 4 bytes
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
        buffer.writeUInt32LE(this.waer, offset);
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
        waer: ${this.waer}
        attachmentPoint: ${this.attachmentPoint}
        damage: ${this.damage}`;
    }
}