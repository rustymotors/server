import { Part } from "../../../packages/database/src/models/Part.entity.js";

export async function populateParts(): Promise<void> {
    await Part.sync();

    await Part.upsert({
        partId: 109,
        parentPartId: 0,
        brandedPartId: 109,
        name: "Mad Max",
        repairPrice: 100,
        junkPrice: 50,
        wear: 0,
        attachmentPoint: 0,
        damage:0 // 1 byte
    });
}
