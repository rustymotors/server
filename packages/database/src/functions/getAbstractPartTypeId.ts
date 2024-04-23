import { getServerLogger } from "@rustymotors/shared";
import { Part } from "../models/Part";
import { PartType } from "../models/PartType";
import { BrandedPart } from "../models/BrandedPart";

/**
 * Get the abstract part type id from the partId
 * 
 * @param partId The part id
 * @returns The abstract part type id
 * @throws {Error} If the part ID is not found
 * @throws {Error} If the abstract part type ID is not found
 */
export async function getAbstractPartTypeId(partId: number): Promise<number> {
    const log = getServerLogger();
    log.setName("getAbstractPartTypeId");

    log.debug(`Getting abstract part type ID for part ${partId}`);

    const abstractPartTypeId = await Part.findOne({
        where: {
            partId,
        },
    }).then(async (part) => {
        if (part === null) {
            throw new Error(`Part ${partId} not found`);
        }

        const partType = await BrandedPart.findByPk(part.brandedPartId).then((brandedPart) => {
            if (brandedPart === null) {
                throw new Error(`Branded part ${part.brandedPartId} not found`);
            }

            return PartType.findByPk(brandedPart.partTypeId).then((partType) => {
                if (partType === null) {
                    throw new Error(`Part type ${brandedPart.partTypeId} not found`);
                }

                return partType.abstractPartTypeId;
            });
        });

        return partType;
    });

    if (abstractPartTypeId === null) {
        throw new Error(`Abstract part type ID not found for part ${partId}`);
    }

    return abstractPartTypeId;
}

        

