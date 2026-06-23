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

import type { IServerMessage } from "rusty-motors-protocol";
import type { ServerLogger } from "rusty-motors-shared";

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
	id: number;
	name: string;
	handler: (args: MessageHandlerArgs) => Promise<MessageHandlerResult>;
}

export function _MSG_STRING(messageID: number): string {
	const messageIds = [
		{ id: 105, name: "MC_LOGIN" },
		{ id: 106, name: "MC_LOGOUT" },
		{ id: 108, name: "MC_GET_PLAYER_INFO" },
		{ id: 109, name: "MC_SET_OPTIONS" },
		{ id: 122, name: "MC_PLAYER_INFO" },
		{ id: 141, name: "MC_STOCK_CAR_INFO" },
		{ id: 142, name: "MC_PURCHASE_STOCK_CAR" },
		{ id: 145, name: "MC_GET_COMPLETE_VEHICLE_INFO" },
		{ id: 163, name: "MC_UPDATE_CACHED_VEHICLE" },
		{ id: 172, name: "MC_GET_OWNED_VEHICLES" },
		{ id: 173, name: "MC_OWNED_VEHICLES_LIST" },
		{ id: 174, name: "MC_GET_OWNED_PARTS" },
		{ id: 176, name: "MC_BUY_NEW_PART" },
		{ id: 177, name: "MC_REPAIR_SINGLE_PART" },
		{ id: 178, name: "MC_REPAIR_MULTIPLE_PARTS" },
		{ id: 181, name: "MC_INSTALL_PART" },
		{ id: 182, name: "MC_REMOVE_PART" },
		{ id: 183, name: "MC_GET_ASSEMBLY_PARTS" },
		{ id: 184, name: "MC_ASSEMBLY_PARTS" },
		{ id: 202, name: "MC_UPDATE_BODY_DAMAGE" },
		{ id: 213, name: "MC_LOGIN_COMPLETE" },
		{ id: 214, name: "MC_DESTROY_PART" },
		{ id: 218, name: "MC_RACE_JOIN" },
		{ id: 230, name: "MC_CREATE_STANDARD_RACE" },
		{ id: 234, name: "MC_RACER_COMPLETED_RACE" },
		{ id: 235, name: "MC_RACER_LEFT_RACE" },
		{ id: 240, name: "MC_IN_RACE_DAMAGE_UPDATE" },
		{ id: 241, name: "MC_REPORT_POST_RACE_DAMAGE" },
		{ id: 264, name: "MC_GET_PLAYER_PHYSICAL" },
		{ id: 265, name: "MC_PLAYER_PHYSICAL_INFO" },
		{ id: 266, name: "MC_UPDATE_PLAYER_PHYSICAL" },
		{ id: 322, name: "MC_GET_ARCADE_CARS" },
		{ id: 324, name: "MC_GET_LOBBIES" },
		{ id: 325, name: "MC_LOBBIES" },
		{ id: 361, name: "MC_GET_PLAYER_RACING_HISTORY" },
		{ id: 362, name: "MC_PLAYER_RACING_HISTORY" },
		{ id: 363, name: "MC_GET_GAME_URLS" },
		{ id: 389, name: "MC_GET_MCO_TUNABLES" },
		{ id: 391, name: "MC_CLUB_GET_INVITATIONS" },
		{ id: 434, name: "MC_CRC_PRE_RACE_DATA" },
		{ id: 435, name: "MC_CRC_POST_RACE_DATA" },
		{ id: 438, name: "MC_CLIENT_CONNECT_MSG" },
		{ id: 440, name: "MC_TRACKING_MSG" },
		{ id: 448, name: "MC_KEEP_RACE_ALIVE" },
		{ id: 455, name: "MC_CRC_PRE_RACE_DATA_TEST_DRIVE" },
	];
	const result = messageIds.find((entry) => entry.id === messageID);
	return result !== undefined ? result.name : "Unknown";
}
