// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { Timestamp } from "rusty-motors-shared";
import { SerializedBufferOld } from "rusty-motors-shared";
import { serializeStringRaw } from "rusty-motors-shared";

/**
 * A message listing the player's owned vehicles
 * This is the body of a MessageNode
 */
export class PlayerInfoMessage extends SerializedBufferOld {
	_msgNo: number; // 2 bytes
	_playerId: number; // 4 bytes
	_playerName: string; // 13 bytes
	_driversLicense: string; // 12 bytes
	_driverClass: number; // 1 byte
	_bankBalance: number; // 4 bytes
	_numberOfVehicles: number; // 2 bytes
	_isLoggedOn: boolean; // 1 byte
	_carsList: string[] = []; // 6 entries of 3 byte strings
	_licensesPlateCode: number; // 2 bytes
	_licensesPlateText: string; // 8 bytes
	_carInfoSetttings: number; // 4 bytes
	_vehicleId: number; // 4 bytes
	_numberOfRacesEntered: number; // 4 bytes
	_numberOfRacesWon: number; // 4 bytes
	_numberOfRacesCompleted: number; // 4 bytes
	_totalWinings: number; // 4 bytes
	_insuranceRisk: number; // 2 bytes
	_insurancePoints: number; // 4 bytes
	_challengeRacesEntered: number; // 4 bytes
	_challengeRacesWon: number; // 4 bytes
	_challengeRacesCompleted: number; // 4 bytes
	_numberofCarsWon: number; // 2 bytes
	_numberOfCarsLost: number; // 2 bytes
	_points: number; // 4 bytes
	_currentLevel: number; // 4 bytes
	_currentRank: number; // 4 bytes
	_numberOfPointsToNextLevel: number; // 2 bytes
	_numberOfPointsToNextRank: number; // 2 bytes
	_maxInventorySlots: number; // 4 bytes
	_numberOfInventorySlotsUsed: number; // 4 bytes
	_numberOfInventoryIemsOnAuction: number; // 4 bytes
	_highestBidInAuction: number; // 4 bytes
	_currentClub: number; // 4 bytes
	_dateLeftClub: Timestamp; // 4 bytes
	_canBeInvitedToClub: boolean; // 1 byte
	_playerDescription: string; // 256 + 1 bytes

	constructor() {
		super();
		this._msgNo = 122; // 2 bytes
		this._playerId = 0; // 4 bytes
		this._playerName = ""; // 13 bytes
		this._driversLicense = ""; // 12 bytes
		this._driverClass = 0; // 1 byte
		this._bankBalance = 0; // 4 bytes
		this._numberOfVehicles = 0; // 2 bytes
		this._isLoggedOn = false; // 1 byte
		this._carsList = ["", "", "", "", "", ""]; // 6 entries of 3 byte strings
		this._licensesPlateCode = 0; // 2 bytes
		this._licensesPlateText = ""; // 8 bytes
		this._carInfoSetttings = 0; // 4 bytes
		this._vehicleId = 0; // 4 bytes
		this._numberOfRacesEntered = 0; // 4 bytes
		this._numberOfRacesWon = 0; // 4 bytes
		this._numberOfRacesCompleted = 0; // 4 bytes
		this._totalWinings = 0; // 4 bytes
		this._insuranceRisk = 0; // 2 bytes
		this._insurancePoints = 0; // 4 bytes
		this._challengeRacesEntered = 0; // 4 bytes
		this._challengeRacesWon = 0; // 4 bytes
		this._challengeRacesCompleted = 0; // 4 bytes
		this._numberofCarsWon = 0; // 2 bytes
		this._numberOfCarsLost = 0; // 2 bytes
		this._points = 0; // 4 bytes
		this._currentLevel = 0; // 4 bytes
		this._currentRank = 0; // 4 bytes
		this._numberOfPointsToNextLevel = 0; // 2 bytes
		this._numberOfPointsToNextRank = 0; // 2 bytes
		this._maxInventorySlots = 0; // 4 bytes
		this._numberOfInventorySlotsUsed = 0; // 4 bytes
		this._numberOfInventoryIemsOnAuction = 0; // 4 bytes
		this._highestBidInAuction = 0; // 4 bytes
		this._currentClub = 0; // 4 bytes
		this._dateLeftClub = new Timestamp(); // 4 bytes
		this._canBeInvitedToClub = false; // 1 byte
		this._playerDescription = ""; // 256 + 1 bytes
		// total byes: 128 + 256 + 1 = 385
	}

	override size() {
		return 385;
	}

	override serialize() {
		const neededSize = this.size();
		const buffer = Buffer.alloc(neededSize);
		let offset = 0; // offset is 0
		buffer.writeUInt16LE(this._msgNo, offset);
		offset += 2; // offset is 2
		buffer.writeUInt32LE(this._playerId, offset);
		offset += 4; // offset is 6
		serializeStringRaw(this._playerName.substring(0, 12), buffer, offset, 13);
		offset += 13; // offset is 19
		serializeStringRaw(
			this._driversLicense.substring(0, 11),
			buffer,
			offset,
			12,
		);
		offset += 12; // offset is 31
		buffer.writeUInt8(this._driverClass, offset);
		offset += 1; // offset is 32
		buffer.writeUInt32LE(this._bankBalance, offset);
		offset += 4; // offset is 36
		buffer.writeUInt16LE(this._numberOfVehicles, offset);
		offset += 2; // offset is 38
		buffer.writeUInt8(this._isLoggedOn ? 1 : 0, offset);
		offset += 1; // offset is 39
		for (const car of this._carsList) {
			buffer.write(car, offset);
			serializeStringRaw(car, buffer, offset, 3);
			offset += 3;
		}
		buffer.writeUInt16LE(this._licensesPlateCode, offset);
		offset += 2; // offset is 41
		serializeStringRaw(
			this._licensesPlateText.substring(0, 7),
			buffer,
			offset,
			8,
		);
		offset += 8; // offset is 49
		buffer.writeUInt32LE(this._carInfoSetttings, offset);
		offset += 4; // offset is 53
		buffer.writeUInt32LE(this._vehicleId, offset);
		offset += 4; // offset is 57
		buffer.writeUInt32LE(this._numberOfRacesEntered, offset);
		offset += 4; // offset is 61
		buffer.writeUInt32LE(this._numberOfRacesWon, offset);
		offset += 4; // offset is 65
		buffer.writeUInt32LE(this._numberOfRacesCompleted, offset);
		offset += 4; // offset is 69
		buffer.writeUInt32LE(this._totalWinings, offset);
		offset += 4; // offset is 73
		buffer.writeUInt16LE(this._insuranceRisk, offset);
		offset += 2; // offset is 75
		buffer.writeUInt32LE(this._insurancePoints, offset);
		offset += 4; // offset is 79
		buffer.writeUInt32LE(this._challengeRacesEntered, offset);
		offset += 4; // offset is 83
		buffer.writeUInt32LE(this._challengeRacesWon, offset);
		offset += 4; // offset is 87
		buffer.writeUInt32LE(this._challengeRacesCompleted, offset);
		offset += 4; // offset is 91
		buffer.writeUInt16LE(this._numberofCarsWon, offset);
		offset += 2; // offset is 93
		buffer.writeUInt16LE(this._numberOfCarsLost, offset);
		offset += 2; // offset is 95
		buffer.writeUInt32LE(this._points, offset);
		offset += 4; // offset is 99
		buffer.writeUInt32LE(this._currentLevel, offset);
		offset += 4; // offset is 103
		buffer.writeUInt32LE(this._currentRank, offset);
		offset += 4; // offset is 107
		buffer.writeUInt16LE(this._numberOfPointsToNextLevel, offset);
		offset += 2; // offset is 109
		buffer.writeUInt16LE(this._numberOfPointsToNextRank, offset);
		offset += 2; // offset is 111
		buffer.writeUInt32LE(this._maxInventorySlots, offset);
		offset += 4; // offset is 115
		buffer.writeUInt32LE(this._numberOfInventorySlotsUsed, offset);
		offset += 4; // offset is 119
		buffer.writeUInt32LE(this._numberOfInventoryIemsOnAuction, offset);
		offset += 4; // offset is 123
		buffer.writeUInt32LE(this._highestBidInAuction, offset);
		offset += 4; // offset is 127
		buffer.writeUInt32LE(this._currentClub, offset);
		offset += 4; // offset is 131
		const dateLeftClubBuffer = this._dateLeftClub.as64BitNumber();
		buffer.writeUInt32LE(dateLeftClubBuffer, offset);
		offset += 4; // offset is 135
		buffer.writeUInt8(this._canBeInvitedToClub ? 1 : 0, offset);
		offset += 1; // offset is 136
		serializeStringRaw(
			this._playerDescription.substring(0, 255),
			buffer,
			offset,
			256,
		);

		return buffer;
	}

	override toString() {
		return `PlayerInfoMessage: msgNo=${this._msgNo} playerId=${this._playerId} playerName=${this._playerName} driversLicense=${this._driversLicense} driverClass=${this._driverClass} bankBalance=${this._bankBalance} numberOfVehicles=${this._numberOfVehicles} isLoggedOn=${this._isLoggedOn} carsList=${this._carsList} licensesPlateCode=${this._licensesPlateCode} licensesPlateText=${this._licensesPlateText} carInfoSetttings=${this._carInfoSetttings} vehicleId=${this._vehicleId} numberOfRacesEntered=${this._numberOfRacesEntered} numberOfRacesWon=${this._numberOfRacesWon} numberOfRacesCompleted=${this._numberOfRacesCompleted} totalWinings=${this._totalWinings} insuranceRisk=${this._insuranceRisk} insurancePoints=${this._insurancePoints} challengeRacesEntered=${this._challengeRacesEntered} challengeRacesWon=${this._challengeRacesWon} challengeRacesCompleted=${this._challengeRacesCompleted} numberofCarsWon=${this._numberofCarsWon} numberOfCarsLost=${this._numberOfCarsLost} points=${this._points} currentLevel=${this._currentLevel} currentRank=${this._currentRank} numberOfPointsToNextLevel=${this._numberOfPointsToNextLevel} numberOfPointsToNextRank=${this._numberOfPointsToNextRank} maxInventorySlots=${this._maxInventorySlots} numberOfInventorySlotsUsed=${this._numberOfInventorySlotsUsed} numberOfInventoryIemsOnAuction=${this._numberOfInventoryIemsOnAuction} highestBidInAuction=${this._highestBidInAuction} currentClub=${this._currentClub} dateLeftClub=${this._dateLeftClub} canBeInvitedToClub=${this._canBeInvitedToClub} playerDescription=${this._playerDescription}`;
	}
}
