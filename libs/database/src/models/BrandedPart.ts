export type BrandedPartType = {
    brandedPartId: number;
    partyTypeId: number;
    modelId: number;
    mfgDate: Date;
    qtyAvailable: number;
    retailPrice: number;
    maxItemWear: number | null;
    engineBlockFamilyId: number;
};
