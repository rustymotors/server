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

import type { ServerLogger  } from "rusty-motors-shared";
import { _getArcadeCarInfo } from "./_getArcadeCarInfo.js";
import { _getGameUrls } from "./_getGameUrls.js";
import { _getOwnedParts } from "./_getOwnedParts.js";
import { _getOwnedVehicles } from "./_getOwnedVehicles.js";
import { _getPlayerInfo } from "./_getPlayerInfo.js";
import { _getPlayerPhysical } from "./_getPlayerPhysical.js";
import { _getPlayerRaceHistory } from "./_getPlayerRaceHistory.js";
import { _getStockCarInfo } from "./_getStockCarInfo.js";
import { _getTunables } from "./_getTunables.js";
import { _logout } from "./_logout.js";
import { clientConnect } from "./clientConnect.js";
import { getLobbies } from "./getLobbies.js";
import { login } from "./login.js";
import { trackingPing } from "./trackingPing.js";
import { _buyCarFromDealer } from "./_buyCarFromDealer.js";
import type { IServerMessage } from "rusty-motors-protocol";
import { _crcPreRaceData } from "./_crcPreRaceData.js";
import { _updateCachedVehicle } from "./_updateCachedVehicle.js";
import { _getCompleteVehicleInfo } from "./_getFullCarInfo.js";
import { _buyNewPart } from "./_buyNewPart.js";
import { _installPart } from "./_installPart.js";
import { _removePart } from "./_removePart.js";
import { _destroyPart } from "./_destroyPart.js";
import { _getAssemblyParts } from "./_getAssemblyParts.js";
import { _repairPart } from "./_repairPart.js";
import { _repairMultipleParts } from "./_repairMultipleParts.js";
import { _createStandardRace } from "./_createStandardRace.js";
import { _joinRace } from "./_joinRace.js";
import { _raceKeepAlive } from "./_raceKeepAlive.js";


export interface MessageHandlerArgs {
	connectionId: string;
	packet: IServerMessage;
	log?: ServerLogger;
}

export interface MessageHandlerResult {
	connectionId: string;
	messages: IServerMessage[];
}

export interface MessageHandler {
	id: number,
	name: string;
	handler: (args: MessageHandlerArgs) => Promise<MessageHandlerResult>;
}

export const messageHandlers: MessageHandler[] = [
    {
        id: 176,
        name: 'MC_BUY_NEW_PART',
        handler: _buyNewPart,
    },
    {
        id: 177,
        name: 'MC_REPAIR_SINGLE_PART',
        handler: _repairPart,
    },
    {
        id: 178,
        name: 'MC_REPAIR_MULTIPLE_PARTS',
        handler: _repairMultipleParts,
    },
    {
        id: 182,
        name: 'MC_REMOVE_PART',
        handler: _removePart,
    },
    {
        id: 181,
        name: 'MC_INSTALL_PART',
        handler: _installPart,
    },
    {
        id: 183,
        name: 'MC_GET_ASSEMBLY_PARTS',
        handler: _getAssemblyParts,
    },
    {
        id: 214,
        name: 'MC_DESTROY_PART',
        handler: _destroyPart,
    },
    {
        id: 440,
        name: 'MC_TRACKING_MSG',
        handler: trackingPing,
    },
    {
        id: 438,
        name: 'MC_CLIENT_CONNECT_MSG',
        handler: clientConnect,
    },
    {
        id: 448,
        name: 'MC_KEEP_RACE_ALIVE',
        handler: _raceKeepAlive,
    },
    {
        id: 105,
        name: 'MC_LOGIN',
        handler: login,
    },
    {
        id: 106,
        name: 'MC_LOGOUT',
        handler: _logout,
    },
    {
        id: 145,
        name: 'MC_GET_COMPLETE_VEHICLE_INFO',
        handler: _getCompleteVehicleInfo,
    },
    {
        id: 324,
        name: 'MC_GET_LOBBIES',
        handler: getLobbies,
    },
    {
        id: 141,
        name: 'MC_STOCK_CAR_INFO',
        handler: _getStockCarInfo,
    },
    {
        id: 322,
        name: 'MC_GET_ARCADE_CARS',
        handler: _getArcadeCarInfo,
    },
    {
        id: 363,
        name: 'MC_GET_GAME_URLS',
        handler: _getGameUrls,
    },
    {
        id: 389,
        name: 'MC_GET_MCO_TUNABLES',
        handler: _getTunables,
    },
    {
        id: 172,
        name: 'MC_GET_OWNED_VEHICLES',
        handler: _getOwnedVehicles,
    },
    {
        id: 108,
        name: 'MC_GET_PLAYER_INFO',
        handler: _getPlayerInfo,
    },
    {
        id: 264,
        name: 'MC_GET_PLAYER_PHYSICAL',
        handler: _getPlayerPhysical,
    },
    {
        id: 174,
        name: 'MC_GET_OWNED_PARTS',
        handler: _getOwnedParts,
    },
    {
        id: 361,
        name: 'MC_GET_PLAYER_RACING_HISTORY',
        handler: _getPlayerRaceHistory,
    },
    {
        id: 142,
        name: 'MC_PURCHASE_STOCK_CAR',
        handler: _buyCarFromDealer,
    },
    {
        id: 455,
        name: 'MC_CRC_PRE_RACE_DATA',
        handler: _crcPreRaceData,
    },
    {
        id: 163,
        name: 'MC_UPDATE_CACHED_VEHICLE',
        handler: _updateCachedVehicle,
    },
    {
        id: 218,
        name: 'MC_RACE_JOIN',
        handler: _joinRace,
    },
    {
        id: 230,
        name: 'MC_CREATE_STANDARD_RACE',
        handler: _createStandardRace,
    },
];
/**
 * Return the string representation of the numeric opcode
 *
 * @param {number} messageID
 * @return {string}
 */
export function _MSG_STRING(messageID: number): string {
	const messageIds = [
		{ id: 105, name: "MC_LOGIN" }, // 0x69
		{ id: 106, name: "MC_LOGOUT" }, // 0x6a
		{ id: 108, name: "MC_GET_PLAYER_INFO" }, // 0x6c
		{ id: 109, name: "MC_SET_OPTIONS" }, // 0x6d
		{ id: 122, name: "MC_PLAYER_INFO" }, // 0x7a"}
		{ id: 141, name: "MC_STOCK_CAR_INFO" }, // 0x8d
		{ id: 142, name: "MC_PURCHASE_STOCK_CAR" }, // 0x8e
		{ id: 145, name: "MC_GET_COMPLETE_VEHICLE_INFO" }, // 0x92
		{ id: 163, name: "MC_UPDATE_CACHED_VEHICLE" },
		{ id: 172, name: "MC_GET_OWNED_VEHICLES" }, // 0xac"}
		{ id: 173, name: "MC_OWNED_VEHICLES_LIST" }, // 0xad"}
		{ id: 174, name: "MC_GET_OWNED_PARTS" }, // 0xae"}
		{ id: 176, name: "MC_BUY_NEW_PART" },
		{ id: 177, name: "MC_REPAIR_SINGLE_PART" },
		{ id: 178, name: "MC_REPAIR_MULTIPLE_PARTS" },
		{ id: 181, name: "MC_INSTALL_PART" },
		{ id: 182, name: "MC_REMOVE_PART" },
		{ id: 183, name: "MC_GET_ASSEMBLY_PARTS" },
		{ id: 184, name: "MC_ASSEMBLY_PARTS" },
		{ id: 213, name: "MC_LOGIN_COMPLETE" }, // 0xd5
		{ id: 214, name: "MC_DESTROY_PART" },
		{ id: 218, name: "MC_RACE_JOIN"},
		{ id: 230, name: "MC_CREATE_STANDARD_RACE" },
		{ id: 264, name: "MC_GET_PLAYER_PHYSICAL" }, // 0x108
		{ id: 265, name: "MC_PLAYER_PHYSICAL_INFO" }, // 0x109
		{ id: 363, name: "MC_GET_GAME_URLS" }, // 0x16b"}
		{ id: 266, name: "MC_UPDATE_PLAYER_PHYSICAL" }, // 0x10a
		{ id: 322, name: "MC_GET_ARCADE_CARS" }, // 0x142"}
		{ id: 324, name: "MC_GET_LOBBIES" }, // 0x144
		{ id: 325, name: "MC_LOBBIES" }, // 0x145
		{ id: 361, name: "MC_GET_PLAYER_RACING_HISTORY" }, // 0x169"}
		{ id: 362, name: "MC_PLAYER_RACING_HISTORY" }, // 0x16a"}
		{ id: 389, name: "MC_GET_MCO_TUNABLES" }, // 0x185"}
		{ id: 391, name: "MC_CLUB_GET_INVITATIONS" }, // 0x187
		{ id: 438, name: "MC_CLIENT_CONNECT_MSG" }, // 0x1b6
		{ id: 440, name: "MC_TRACKING_MSG" },
		{ id: 448, name: "MC_KEEP_RACE_ALIVE" }, // 0x1C0
		{ id: 202, name: "MC_UPDATE_BODY_DAMAGE" }, // 0xCA
		{ id: 234, name: "MC_RACER_COMPLETED_RACE" }, // 0xEA
		{ id: 235, name: "MC_RACER_LEFT_RACE" }, // 0xEB
		{ id: 240, name: "MC_IN_RACE_DAMAGE_UPDATE" }, // 0xF0
		{ id: 241, name: "MC_REPORT_POST_RACE_DAMAGE" }, // 0xF1
		{ id: 434, name: "MC_CRC_PRE_RACE_DATA" }, // 0x1B2
		{ id: 435, name: "MC_CRC_POST_RACE_DATA" }, // 0x1B3
		{ id: 455, name: "MC_CRC_PRE_RACE_DATA_TEST_DRIVE" }, // 0x1C7
	];
	const result = messageIds.find((id) => id.id === messageID);

	if (typeof result !== "undefined") {
		return result.name;
	}

	return "Unknown";
}


