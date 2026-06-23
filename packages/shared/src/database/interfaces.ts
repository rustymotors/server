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

import type {
    ConnectionRecord,
    IRunningServerInfo,
    UserRecordMini,
} from "../types.js";
import type { UserInfo } from "../UserData.js";

/**
 * Session store interface - manages runtime connection/session state
 * This is for in-memory session tracking during server runtime
 */
export interface ISessionStore {
    updateSessionKey(
        customerId: number,
        sessionKey: string,
        contextId: string,
        connectionId: string,
    ): Promise<void>;

    fetchSessionKeyByCustomerId(customerId: number): Promise<ConnectionRecord>;

    fetchSessionKeyByConnectionId(connectionId: string): Promise<ConnectionRecord>;

    updateUser(user: { userId: number; userInfo: UserInfo }): Promise<void>;

    getUser(userId: number): Promise<UserInfo | undefined>;

    updateConnection(connectionId: string, userId: number): Promise<void>;

    findUserByConnectionId(connectionId: string): Promise<number | undefined>;

    updateGameServer(
        commId: number,
        gameServer: IRunningServerInfo,
    ): Promise<void>;

    getGameServers(): Promise<IRunningServerInfo[]>;
}

/**
 * Game data store interface - manages persistent game data
 * This is for PostgreSQL-backed vehicle, parts, and player data
 */
export interface IGameDataStore {
    getPlayer(playerId: number): Promise<Player>;

    getOwnedVehiclesForPerson(personId: number): Promise<OwnedVehicle[]>;

    getVehicleAndParts(vehicleId: number): Promise<VehicleRecord | null>;

    createNewCar(
        brandedPartId: number,
        skinId: number,
        ownerId: number,
    ): Promise<number>;

    purchaseCar(
        playerId: number,
        dealerId: number,
        brandedPartId: number,
        skinId: number,
        tradeInCarId: number,
    ): Promise<number>;

    getPartCatalog(aptId: number, blockFamilyId: number): Promise<number[]>;
}

/**
 * Auth store interface - manages authentication and local session cache
 * This is for SQLite-backed login credentials and session tracking
 */
export interface IAuthStore {
    readonly isDatabaseConnected: boolean;

    findUser(
        username: string,
        password: string,
    ): Promise<{ customerId: number; userName: string; loginLevel: number }>;

    findCustomerByContext(contextId: string): UserRecordMini | undefined;

    updateSession(
        customerId: number,
        contextId: string,
        profileId: number,
    ): void;

    registerNewUser(
        username: string,
        password: string,
        customerId: number,
    ): void;
}

/**
 * Combined database services interface
 */
export interface IDatabaseServices {
    session: ISessionStore;
    gameData: IGameDataStore;
    auth: IAuthStore;
}

/**
 * Player record from PostgreSQL
 */
export type Player = {
    player_id: number;
    customer_id: number;
    player_type_id: number;
    sanctioned_scole: number;
    challenge_score: number;
    last_logged_in: number;
    times_logged_in: number;
    bank_balance: number;
    num_cars_owned: number;
    driver_style: number;
    lp_code: number;
    lp_text: string;
    car_num1: string;
    car_num2: string;
    car_num3: string;
    car_num4: string;
    car_num5: string;
    dd_number: string;
    persona: string;
    address: string;
    residence: string;
    vehicle_id: number;
    current_race_id: number;
    offline_driver_skill: number;
    offline_grudge: number;
    offline_reputation: number;
    total_time_played: number;
    car_info_setting: number;
    stock_classic_class: number;
    stock_muscle_class: number;
    modified_classic_class: number;
    modified_muscle_class: number;
    outlaw_class: number;
    drag_class: number;
    challenge_rung: number;
    offline_ai_car_class: number;
    offline_ai_car_bpt_id: number;
    offline_state: number;
    body_type: number;
    skin_color: number;
    hair_color: number;
    shirt_xolor: number;
    parts_color: number;
    offline_driver_style: number;
    offline_driver_attitude: number;
    evaded_fuzz: number;
    pinks_won: number;
    num_unread_mail: number;
    total_races_won: number;
    total_races_completed: number;
    total_winnings: number;
    insurance_risk_points: number;
    insurence_rating: number;
    challenge_races_run: number;
    challenge_races_won: number;
    challenge_raced_completed: number;
    cars_lost: number;
    cars_won: number;
};

/**
 * Vehicle part entry
 */
export type PartEntry = {
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
 * Vehicle record with parts
 */
export type VehicleRecord = {
    vehicleId: number;
    skinId: number;
    flags: number;
    class: number;
    infoSetting: number;
    damageInfo: number;
    ownerId: number;
    parts: PartEntry[];
};

/**
 * Owned vehicle summary
 */
export type OwnedVehicle = {
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
