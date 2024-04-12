/// <reference types="node" />
import { SerializedBuffer } from "rusty-shared";
/**
 * A message listing the lobbies
 * This is the body of a MessageNode
 */
export declare class TunablesMessage extends SerializedBuffer {
    _msgNo: number;
    _clubCreationCost: number;
    _clubCreationRequiredLevel: number;
    _clubOfficerRequiredLevel: number;
    _inventorySizePerLevel: number;
    _carsPerLevel: number;
    _maxEZStreetLevel: number;
    _clubSwitchCooldown: number;
    _universalRepairCostModifier: number;
    _universalScrapValueModifier: number;
    _addCost1Day: number;
    _addCost2Days: number;
    _addCost3Days: number;
    _addCost4Days: number;
    _addCost5Days: number;
    _addCost6Days: number;
    _addCost7Days: number;
    _tradeinModifier: number;
    _simStreetMaxWager: number;
    saleryPerLevel: number;
    _clubMaxMembers: number;
    _clubRegistrationCost: number;
    _clubReRegistrationCost: number;
    _classifiedAdRate: number;
    _classifiedAdMaxDuration: number;
    _classifiedAdMaxSize: number;
    _classifiedAdMaxCountPerPlayer: number;
    constructor();
    size(): number;
    serialize(): Buffer;
    toString(): string;
}
