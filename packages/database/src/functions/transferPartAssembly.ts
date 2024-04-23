import { getServerLogger } from "@rustymotors/shared";
import { getDatabase } from "../services/database";
import { Part } from "../models/Part";
import { parentPort } from "worker_threads";
import { Vehicle } from "../models/Vehicle";
import { Player } from "../models/Player";
import { getAbstractPartTypeId } from "./getAbstractPartTypeId";

/**
 * Transfer a part assembly
 * 
 * This function transfers a part assembly from one owner to another, including all child parts.
 * 
 * This function does NOT use a transaction.
 * 
 * @param {number} partId
 * @param {number} newOwnerId
 * 
 * @returns {Promise<void>}
 * @throws {Error} If the part ID is not found
 * @throws {Error} If the new owner ID is not found
 * @throws {Error} If the part cannot be transferred
 */
export async function transferPartAssembly(
    partId: number,
    newOwnerId: number,
): Promise<void> {
    const log = getServerLogger();
    log.setName("transferPartAssembly");

    log.debug(`Transferring part assembly ${partId} to new owner ${newOwnerId}`);

    const topPart = await Part.findByPk(partId);

    if (topPart === null) {
        throw new Error(`Part ${partId} not found`);
    }

    if (topPart.ownerID === null) {
        throw new Error(`Part ${partId} has no owner`);
    }

    if (topPart.ownerID === newOwnerId) {
        throw new Error(`Part ${partId} is already owned by ${newOwnerId}`);
    }

    const ownerExists = await Player.findByPk(newOwnerId).then((player) => player !== null);

    if (!ownerExists) {
        throw new Error(`Owner ${newOwnerId} not found`);
    }

    const children = await Part.findAll({ where: { parentPartId: partId } });

    try {
        // If the part is a car, update the owner ID in the vehicle table
        const isPartACar = await getAbstractPartTypeId(topPart.brandedPartId).then((abstractPartTypeId) => abstractPartTypeId === 1);
        

        if (isPartACar) {
            const car = await Vehicle.findByPk(partId);

            if (car !== null) {
                car. = newOwnerId;
                await car.save();
            }
        }



        for (const child of children) {
            child.ownerID = newOwnerId;
            await child.save();
        }

        const parentPart = await Part.findByPk(partId);

        if (parentPart !== null) {
            parentPart.ownerID = newOwnerId;
            await parentPart.save();
        }





    } catch (error) {
        throw new Error(`Error transferring part ${partId}: ${String(error)}`);        
    }


    topPart.ownerID = newOwnerId;
    await topPart.save();

    log.debug(`Part assembly ${partId} transferred to new owner ${newOwnerId}`);
}
