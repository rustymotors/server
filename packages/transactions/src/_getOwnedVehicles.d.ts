import type { MessageHandlerArgs, MessageHandlerResult } from "../types.js";
export declare function getVehiclesForPerson(personId: number): {
    personId: number;
    vehicleId: number;
    brandedPartId: number;
}[];
export declare function _getOwnedVehicles(
    args: MessageHandlerArgs,
): Promise<MessageHandlerResult>;
