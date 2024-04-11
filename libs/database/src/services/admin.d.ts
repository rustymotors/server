export declare function createNewCar(
    brandedPartId: number,
    skinId: number,
    newCarOwnerId: number,
): Promise<number>;
export type DBPart = {
    partId: number;
    parentPartId: number;
    brandedPartId: number;
    percentDamage: number;
    itemWear: number;
    attachmentPointId: number;
    ownerId: number;
    partName: string;
    repairCost: number;
    scrapValue: number;
};
