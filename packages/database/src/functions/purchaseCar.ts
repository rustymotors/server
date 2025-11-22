import { getServerLogger } from 'rusty-motors-shared';

import { createNewCar } from './createNewCar.js';
import { buildVehiclePartTree } from '../cache.js';

export async function purchaseCar(
    playerId: number,
    dealerId: number,
    brandedPardId: number,
    skinId: number,
    tradeInCarId: number,
): Promise<number> {
try {
    getServerLogger('purchaseCar').verbose(
        `Player ${playerId} is purchasing car from dealer ${dealerId} with branded part ${brandedPardId} and skin ${skinId} and trading in car ${tradeInCarId}`,
    );

    if (dealerId === 6) {
        // This is a new stock car and likeley does not exist in the server yet
        // We need to create the car and add it to the player's lot

        // Create the new car
        const newCarId = await createNewCar(
            brandedPardId,
            skinId,
            playerId,
        ).catch((error) => {
            getServerLogger('purchaseCar').error(
                `Error creating new car for player ${playerId}`,
                { error },
            );
            throw error;
        });

        getServerLogger('purchaseCar').verbose(
            `Player ${playerId} purchased car with ID ${newCarId}`,
        );

        return newCarId;
    }
    
    const parts = await buildVehiclePartTree({
        brandedPartId: brandedPardId,
        skinId,
        isStock: true,
        ownedLotId: dealerId,
        ownerID: playerId,
    });

    getServerLogger('purchaseCar').verbose(
        `Built vehicle part tree for player ${playerId}`,
        { parts },
    );

    return 1000;
} catch (error) {
    getServerLogger('purchaseCar').error(
        `Error purchasing car for player ${playerId}`,
        { error },
    );
    throw error;
}
}