import { AttachmentPoint } from "../../../packages/database/src/models/AttachmentPoint.entity.js";
import { Brand } from "../../../packages/database/src/models/Brand.entity.js";
import { BrandedPart } from "../../../packages/database/src/models/BrandedPart.entity.js";
import { Model } from "../../../packages/database/src/models/Model.entity.js";
import { Part } from "../../../packages/database/src/models/Part.entity.js";
import { log } from "../../../packages/shared/log.js";

export async function populateParts(): Promise<void> {
    try {
        log.debug("Populating attachment points");
        await AttachmentPoint.sync();
        await AttachmentPoint.upsert({
            attachmentPointId: 0,
            attachmentPoint: "default",
        });
    } catch (error) {
        log.error(`Error populating attachment points: ${error}`);
        throw error;
    }

    try {
        log.debug("Populating brands");
        await Brand.sync();
        await Brand.upsert({
            BrandId: 7,
            Brand: "Pontiac",
            PicName: "pont",
            IsStock: 9,
        });
    } catch (error) {
        log.error(`Error populating brands: ${error}`);
        throw error;
    }
    try {
        log.debug("Populating models");
        await Model.sync();
        await Model.upsert({
            ModelID: 20,
            BrandID: 7,
            EModel: "Firebird T/A",
            GModel: null,
            FModel: null,
            SModel: null,
            IModel: null,
            JModel: null,
            SwModel: null,
            BModel: null,
            EExtraInfo: "a/t",
            GExtraInfo: null,
            FExtraInfo: null,
            SExtraInfo: null,
            IExtraInfo: null,
            JExtraInfo: null,
            SwExtraInfo: null,
            BExtraInfo: null,
            EShortModel: "Firebird",
            GShortModel: null,
            FShortModel: null,
            SShortModel: null,
            IShortModel: null,
            JShortModel: null,
            SwShortModel: null,
            BShortModel: null,
            Debug_String: "Pontiac 73 Firebird T/A",
            Debug_Sort_String: "Vehicle",
        });
    } catch (error) {
        log.error(`Error populating models: ${error}`);
        throw error;
    }
    try {
        log.debug("Populating branded parts");
        await BrandedPart.sync();
        await BrandedPart.upsert({
            BrandedPartID: 130,
            PartTypeID: 130,
            ModelID: 20,
            MfgDate: new Date("1973-01-01 00:00:00.000"),
            QtyAvail: 0,
            RetailPrice: 0,
            MaxItemWear: 30000,
            EngineBlockFamilyID: 0,
        });

        await BrandedPart.upsert({
            BrandedPartID: 1000,
            PartTypeID: 130,
            ModelID: 20,
            MfgDate: new Date("1973-01-01 00:00:00.000"),
            QtyAvail: 0,
            RetailPrice: 0,
            MaxItemWear: 30000,
            EngineBlockFamilyID: 0,
        });

        await BrandedPart.upsert({
            BrandedPartID: 1001,
            PartTypeID: 130,
            ModelID: 20,
            MfgDate: new Date("1973-01-01 00:00:00.000"),
            QtyAvail: 0,
            RetailPrice: 0,
            MaxItemWear: 30000,
            EngineBlockFamilyID: 0,
        });
    } catch (error) {
        log.error(`Error populating branded parts: ${error}`);
        throw error;
    }
    try {
        log.debug("Populating parts");
        await Part.sync();
        await Part.upsert({
            partId: 1,
            parentPartId: null,
            brandedPartId: 130,
            name: "Mad Max",
            repairPrice: 100,
            junkPrice: 50,
            wear: 0,
            attachmentPoint: 0,
            damage: 0, // 1 byte
        });

        await Part.upsert({
            partId: 2,
            parentPartId: 1,
            brandedPartId: 1001,
            name: "Mad Max",
            repairPrice: 100,
            junkPrice: 50,
            wear: 0,
            attachmentPoint: 0,
            damage: 0, // 1 byte
        });
    } catch (error) {
        log.error(`Error populating parts: ${error}`);
        throw error;
    }
}
