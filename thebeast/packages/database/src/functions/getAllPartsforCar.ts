import { log } from "../../../shared/log.js";
import { Part } from "../models/Part.entity.js";

export async function getAllPartsforCar(carId: number): Promise<Part[]> {
    // Create a temp table to store all parts
    const parts: Part[] = [];

    log.debug(`Getting all parts for car with id ${carId}`);

    // Get top part for car
    const topPart = await Part.findOne({ where: { partId: carId } });

    if (!topPart) {
        throw new Error(`No parts found for car with id ${carId}`);
    }

    log.debug(`Found part for car with id ${carId}: ${topPart.toJSON()}`);
    parts.push(topPart);

    // Search for all parts where the top part is the parent and the part is not yet in the list
    let newParts = await Part.findAll({
        where: { parentPartId: topPart.partId },
    });

    log.debug(`Found ${newParts.length} parts for car with id ${carId}`);
    while (newParts.length > 0) {
        log.debug(
            `Addibg parts to list: ${newParts.map((part) => part.toJSON())}`,
        );
        parts.push(...newParts);
        const newPartIds = newParts.map((part) => part.partId);
        log.debug(`Getting new parts for ids: ${newPartIds}`);
        newParts = await Part.findAll({ where: { parentPartId: newPartIds } });
    }

    log.debug(`Returning ${parts.length} parts for car with id ${carId}`);
    return parts;
}
