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

/**
 * Transactions Handler Registry
 *
 * This module uses the MessageHandlerRegistry to register all MCOTS transaction message handlers.
 * Handles port 43300 (MCOTS protocol).
 */

import { MessageHandlerRegistry } from 'rusty-motors-shared';
import type { MessageHandlerArgs, MessageHandlerResult } from '../types.js';

import { _getArcadeCarInfo } from '../_getArcadeCarInfo.js';
import { _getGameUrls } from '../_getGameUrls.js';
import { _getOwnedParts } from '../_getOwnedParts.js';
import { _getOwnedVehicles } from '../_getOwnedVehicles.js';
import { _getPlayerInfo } from '../_getPlayerInfo.js';
import { _getPlayerPhysical } from '../_getPlayerPhysical.js';
import { _getPlayerRaceHistory } from '../_getPlayerRaceHistory.js';
import { _getStockCarInfo } from '../_getStockCarInfo.js';
import { _getTunables } from '../_getTunables.js';
import { _logout } from '../_logout.js';
import { clientConnect } from '../clientConnect.js';
import { getLobbies } from '../getLobbies.js';
import { login } from '../login.js';
import { trackingPing } from '../trackingPing.js';
import { _buyCarFromDealer } from '../_buyCarFromDealer.js';
import { _crcPostRaceData } from '../_crcPostRaceData.js';
import { _crcPreRaceData } from '../_crcPreRaceData.js';
import { _crcPreRaceDataTestDrive } from '../_crcPreRaceDataTestDrive.js';
import { _inRaceDamageUpdate } from '../_inRaceDamageUpdate.js';
import { _racerLeftRace } from '../_racerLeftRace.js';
import { _reportPostRaceDamage } from '../_reportPostRaceDamage.js';
import { _updateBodyDamage } from '../_updateBodyDamage.js';
import { _updateCachedVehicle } from '../_updateCachedVehicle.js';
import { _getCompleteVehicleInfo } from '../_getFullCarInfo.js';
import { _buyNewPart } from '../_buyNewPart.js';
import { _createStandardRace } from '../_createStandardRace.js';
import { _joinRace } from '../_joinRace.js';
import { _raceKeepAlive } from '../_raceKeepAlive.js';
import { _racerCompletedRace } from '../_racerCompletedRace.js';
import { _startRace } from '../_startRace.js';
import { _repairPart } from '../_repairPart.js';
import { _repairMultipleParts } from '../_repairMultipleParts.js';
import { _removePart } from '../_removePart.js';
import { _installPart } from '../_installPart.js';
import { _getAssemblyParts } from '../_getAssemblyParts.js';
import { _destroyPart } from '../_destroyPart.js';

/**
 * Creates and returns a configured transactions handler registry.
 *
 * @returns A MessageHandlerRegistry configured with all MCOTS transaction handlers
 */
export function createTransactionsHandlerRegistry(): MessageHandlerRegistry<
    MessageHandlerArgs,
    MessageHandlerResult
> {
    const registry = new MessageHandlerRegistry<MessageHandlerArgs, MessageHandlerResult>('transactions');

    registry.register({
        opCode: 176, // MC_BUY_NEW_PART
        name: 'MC_BUY_NEW_PART',
        handler: _buyNewPart,
    });

    registry.register({
        opCode: 177, // MC_REPAIR_SINGLE_PART
        name: 'MC_REPAIR_SINGLE_PART',
        handler: _repairPart,
    });

    registry.register({
        opCode: 178, // MC_REPAIR_MULTIPLE_PARTS
        name: 'MC_REPAIR_MULTIPLE_PARTS',
        handler: _repairMultipleParts,
    });

    registry.register({
        opCode: 181, // MC_INSTALL_PART
        name: 'MC_INSTALL_PART',
        handler: _installPart,
    });

    registry.register({
        opCode: 182, // MC_REMOVE_PART
        name: 'MC_REMOVE_PART',
        handler: _removePart,
    });

    registry.register({
        opCode: 183, // MC_GET_ASSEMBLY_PARTS
        name: 'MC_GET_ASSEMBLY_PARTS',
        handler: _getAssemblyParts,
    });

    registry.register({
        opCode: 214, // MC_DESTROY_PART
        name: 'MC_DESTROY_PART',
        handler: _destroyPart,
    });

    registry.register({
        opCode: 440, // MC_TRACKING_MSG
        name: 'MC_TRACKING_MSG',
        handler: trackingPing,
    });

    registry.register({
        opCode: 438, // MC_CLIENT_CONNECT_MSG
        name: 'MC_CLIENT_CONNECT_MSG',
        handler: clientConnect,
    });

    registry.register({
        opCode: 448, // MC_KEEP_RACE_ALIVE
        name: 'MC_KEEP_RACE_ALIVE',
        handler: _raceKeepAlive,
    });

    registry.register({
        opCode: 105, // MC_LOGIN
        name: 'MC_LOGIN',
        handler: login,
    });

    registry.register({
        opCode: 106, // MC_LOGOUT
        name: 'MC_LOGOUT',
        handler: _logout,
    });

    registry.register({
        opCode: 145, // MC_GET_COMPLETE_VEHICLE_INFO
        name: 'MC_GET_COMPLETE_VEHICLE_INFO',
        handler: _getCompleteVehicleInfo,
    });

    registry.register({
        opCode: 324, // MC_GET_LOBBIES
        name: 'MC_GET_LOBBIES',
        handler: getLobbies,
    });

    registry.register({
        opCode: 141, // MC_STOCK_CAR_INFO
        name: 'MC_STOCK_CAR_INFO',
        handler: _getStockCarInfo,
    });

    registry.register({
        opCode: 322, // MC_GET_ARCADE_CARS
        name: 'MC_GET_ARCADE_CARS',
        handler: _getArcadeCarInfo,
    });

    registry.register({
        opCode: 363, // MC_GET_GAME_URLS
        name: 'MC_GET_GAME_URLS',
        handler: _getGameUrls,
    });

    registry.register({
        opCode: 389, // MC_GET_MCO_TUNABLES
        name: 'MC_GET_MCO_TUNABLES',
        handler: _getTunables,
    });

    registry.register({
        opCode: 172, // MC_GET_OWNED_VEHICLES
        name: 'MC_GET_OWNED_VEHICLES',
        handler: _getOwnedVehicles,
    });

    registry.register({
        opCode: 108, // MC_GET_PLAYER_INFO
        name: 'MC_GET_PLAYER_INFO',
        handler: _getPlayerInfo,
    });

    registry.register({
        opCode: 264, // MC_GET_PLAYER_PHYSICAL
        name: 'MC_GET_PLAYER_PHYSICAL',
        handler: _getPlayerPhysical,
    });

    registry.register({
        opCode: 174, // MC_GET_OWNED_PARTS
        name: 'MC_GET_OWNED_PARTS',
        handler: _getOwnedParts,
    });

    registry.register({
        opCode: 361, // MC_GET_PLAYER_RACING_HISTORY
        name: 'MC_GET_PLAYER_RACING_HISTORY',
        handler: _getPlayerRaceHistory,
    });

    registry.register({
        opCode: 142, // MC_PURCHASE_STOCK_CAR
        name: 'MC_PURCHASE_STOCK_CAR',
        handler: _buyCarFromDealer,
    });

    registry.register({
        opCode: 202, // MC_UPDATE_BODY_DAMAGE
        name: 'MC_UPDATE_BODY_DAMAGE',
        handler: _updateBodyDamage,
    });

    registry.register({
        opCode: 235, // MC_RACER_LEFT_RACE
        name: 'MC_RACER_LEFT_RACE',
        handler: _racerLeftRace,
    });

    registry.register({
        opCode: 240, // MC_IN_RACE_DAMAGE_UPDATE
        name: 'MC_IN_RACE_DAMAGE_UPDATE',
        handler: _inRaceDamageUpdate,
    });

    registry.register({
        opCode: 241, // MC_REPORT_POST_RACE_DAMAGE
        name: 'MC_REPORT_POST_RACE_DAMAGE',
        handler: _reportPostRaceDamage,
    });

    registry.register({
        opCode: 434, // MC_CRC_PRE_RACE_DATA
        name: 'MC_CRC_PRE_RACE_DATA',
        handler: _crcPreRaceData,
    });

    registry.register({
        opCode: 435, // MC_CRC_POST_RACE_DATA
        name: 'MC_CRC_POST_RACE_DATA',
        handler: _crcPostRaceData,
    });

    registry.register({
        opCode: 455, // MC_CRC_PRE_RACE_DATA_TEST_DRIVE
        name: 'MC_CRC_PRE_RACE_DATA_TEST_DRIVE',
        handler: _crcPreRaceDataTestDrive,
    });

    registry.register({
        opCode: 163, // MC_UPDATE_CACHED_VEHICLE
        name: 'MC_UPDATE_CACHED_VEHICLE',
        handler: _updateCachedVehicle,
    });

    registry.register({
        opCode: 218, // MC_RACE_JOIN
        name: 'MC_RACE_JOIN',
        handler: _joinRace,
    });

    registry.register({
        opCode: 230, // MC_CREATE_STANDARD_RACE
        name: 'MC_CREATE_STANDARD_RACE',
        handler: _createStandardRace,
    });

    registry.register({
        opCode: 232, // MC_RACE_START
        name: 'MC_RACE_START',
        handler: _startRace,
    });

    registry.register({
        opCode: 234, // MC_RACER_COMPLETED_RACE
        name: 'MC_RACER_COMPLETED_RACE',
        handler: _racerCompletedRace,
    });

    return registry;
}

/**
 * Singleton instance of the transactions handler registry.
 */
let transactionsRegistryInstance: MessageHandlerRegistry<MessageHandlerArgs, MessageHandlerResult> | null = null;

/**
 * Gets the singleton transactions handler registry instance.
 */
export function getTransactionsHandlerRegistry(): MessageHandlerRegistry<
    MessageHandlerArgs,
    MessageHandlerResult
> {
    if (!transactionsRegistryInstance) {
        transactionsRegistryInstance = createTransactionsHandlerRegistry();
    }
    return transactionsRegistryInstance;
}

/**
 * Clears the singleton transactions handler registry.
 * Useful for testing.
 */
export function clearTransactionsHandlerRegistry(): void {
    transactionsRegistryInstance = null;
}
