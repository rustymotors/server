/// <reference types="node" />
import type { MessageHandlerArgs, MessageHandlerResult } from "../../types.js";
export declare class VehicleStruct {
    VehicleID: number;
    SkinID: number;
    Flags: number;
    Delta: number;
    CarClass: number;
    Damage: Buffer;
    serialize(): Buffer;
    size(): number;
    toString(): string;
}
export declare class PartStruct {
    partId: number;
    parentPartId: number | null;
    brandedPartId: number;
    repairCost: number;
    junkyardValue: number;
    wear: number;
    arttachmentPoint: number;
    damage: number;
    serialize(): Buffer;
    size(): number;
    toString(): string;
}
export type DBPart = {
    partId: number;
    parentPartId: number | null;
    brandedPartId: number;
    percentDamage: number;
    itemWear: number;
    attachmentPointId: number;
    ownerId: number;
    partName: string;
    repairCost: number;
    scrapValue: number;
};
/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
export declare function _getCompleteVehicleInfo({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult>;
