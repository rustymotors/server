/// <reference types="node" />
import { SerializedBuffer } from "@rustymotors/shared";
import { Timestamp } from "@rustymotors/shared";
/**
 * A message listing the player's owned vehicles
 * This is the body of a MessageNode
 */
export declare class PlayerInfoMessage extends SerializedBuffer {
    _msgNo: number;
    _playerId: number;
    _playerName: string;
    _driversLicense: string;
    _driverClass: number;
    _bankBalance: number;
    _numberOfVehicles: number;
    _isLoggedOn: boolean;
    _carsList: string[];
    _licensesPlateCode: number;
    _licensesPlateText: string;
    _carInfoSetttings: number;
    _vehicleId: number;
    _numberOfRacesEntered: number;
    _numberOfRacesWon: number;
    _numberOfRacesCompleted: number;
    _totalWinings: number;
    _insuranceRisk: number;
    _insurancePoints: number;
    _challengeRacesEntered: number;
    _challengeRacesWon: number;
    _challengeRacesCompleted: number;
    _numberofCarsWon: number;
    _numberOfCarsLost: number;
    _points: number;
    _currentLevel: number;
    _currentRank: number;
    _numberOfPointsToNextLevel: number;
    _numberOfPointsToNextRank: number;
    _maxInventorySlots: number;
    _numberOfInventorySlotsUsed: number;
    _numberOfInventoryIemsOnAuction: number;
    _highestBidInAuction: number;
    _currentClub: number;
    _dateLeftClub: Timestamp;
    _canBeInvitedToClub: boolean;
    _playerDescription: string;
    constructor();
    size(): number;
    serialize(): Buffer;
    toString(): string;
}
