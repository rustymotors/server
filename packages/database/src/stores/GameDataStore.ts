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

import { createPool, type DatabasePool, createSqlTag } from "slonik";
import { z } from "zod";
import * as Sentry from "@sentry/node";
import { getServerLogger } from "rusty-motors-shared";
import type {
    IGameDataStore,
    Player,
    VehicleRecord,
    OwnedVehicle,
    PartEntry,
} from "rusty-motors-shared";
import { buildVehiclePartTree, saveVehicle, saveVehiclePartTree } from "../cache.js";

const log = getServerLogger("GameDataStore");

/**
 * PostgreSQL-backed game data store implementation
 * Manages persistent game data: vehicles, parts, players
 */
export class GameDataStore implements IGameDataStore {
    private pool: DatabasePool | null = null;
    private sqlTag: ReturnType<typeof createSqlTag> | null = null;
    private databaseUrl: string;

    constructor(databaseUrl: string) {
        this.databaseUrl = databaseUrl;
    }

    private initSQL() {
        return createSqlTag({
            typeAliases: {
                vehicleWithOwner: z.object({
                    vehicle_id: z.number(),
                    skin_id: z.number(),
                    flags: z.number(),
                    class: z.number(),
                    info_setting: z.number(),
                    damage_info: z.number(),
                    owner_id: z.number(),
                }),
                part: z.object({
                    part_id: z.number(),
                    parent_part_id: z.number(),
                    branded_part_id: z.number(),
                    percent_damage: z.number(),
                    item_wear: z.number(),
                    attachment_point_id: z.number(),
                    part_name: z.string().nullable(),
                    owner_id: z.number(),
                    repair_cost: z.number(),
                    scrap_value: z.number(),
                }),
                id: z.number(),
                abstractPartType: z.object({
                    abstract_part_type_id: z.number(),
                }),
                ptSkin: z.object({
                    skin_id: z.number(),
                    default_flag: z.number(),
                }),
                player: z.object({
                    player_id: z.number(),
                    customer_id: z.number(),
                    player_type_id: z.number(),
                    sanctioned_scole: z.number(),
                    challenge_score: z.number(),
                    last_logged_in: z.number(),
                    times_logged_in: z.number(),
                    bank_balance: z.number(),
                    num_cars_owned: z.number(),
                    driver_style: z.number(),
                    lp_code: z.number(),
                    lp_text: z.string(),
                    car_num1: z.string(),
                    car_num2: z.string(),
                    car_num3: z.string(),
                    car_num4: z.string(),
                    car_num5: z.string(),
                    dd_number: z.string(),
                    persona: z.string(),
                    address: z.string(),
                    residence: z.string(),
                    vehicle_id: z.number(),
                    current_race_id: z.number(),
                    offline_driver_skill: z.number(),
                    offline_grudge: z.number(),
                    offline_reputation: z.number(),
                    total_time_played: z.number(),
                    car_info_setting: z.number(),
                    stock_classic_class: z.number(),
                    stock_muscle_class: z.number(),
                    modified_classic_class: z.number(),
                    modified_muscle_class: z.number(),
                    outlaw_class: z.number(),
                    drag_class: z.number(),
                    challenge_rung: z.number(),
                    offline_ai_car_class: z.number(),
                    offline_ai_car_bpt_id: z.number(),
                    offline_state: z.number(),
                    body_type: z.number(),
                    skin_color: z.number(),
                    hair_color: z.number(),
                    shirt_xolor: z.number(),
                    parts_color: z.number(),
                    offline_driver_style: z.number(),
                    offline_driver_attitude: z.number(),
                    evaded_fuzz: z.number(),
                    pinks_won: z.number(),
                    num_unread_mail: z.number(),
                    total_races_won: z.number(),
                    total_races_completed: z.number(),
                    total_winnings: z.number(),
                    insurance_risk_points: z.number(),
                    insurence_rating: z.number(),
                    challenge_races_run: z.number(),
                    challenge_races_won: z.number(),
                    challenge_raced_completed: z.number(),
                    cars_lost: z.number(),
                    cars_won: z.number(),
                }),
            },
        });
    }

    private async ensureConnection(): Promise<{
        pool: DatabasePool;
        sql: ReturnType<typeof createSqlTag>;
    }> {
        if (!this.pool) {
            this.pool = await createPool(this.databaseUrl);
        }
        if (!this.sqlTag) {
            this.sqlTag = this.initSQL();
        }
        return { pool: this.pool, sql: this.sqlTag };
    }

    async getPlayer(playerId: number): Promise<Player> {
        const { pool, sql } = await this.ensureConnection();
        try {
            const player = (await pool.one(sql.typeAlias("player")`
                SELECT *
                FROM player
                WHERE player_id = ${playerId}
            `)) as Player;

            return player;
        } catch (error) {
            log.error(`Error fetching player: ${String(error)}`);
            throw error;
        }
    }

    async getOwnedVehiclesForPerson(personId: number): Promise<OwnedVehicle[]> {
        const { pool, sql } = await this.ensureConnection();
        return Sentry.startSpan(
            {
                name: "Get owned vehicles for person",
                op: "db.query",
                attributes: {
                    db: "postgres",
                },
            },
            async () => {
                const cars: OwnedVehicle[] = [];
                const parts = await pool.any(sql.typeAlias("part")`
                    SELECT p.part_id, p.branded_part_id, p.attachment_point_id,
                           p.owner_id, p.part_name, p.repair_cost, p.scrap_value
                    FROM public.part p
                    INNER JOIN public.vehicle v ON v.vehicle_id = p.part_id
                    WHERE p.owner_id = ${personId}
                `);
                for (const part of parts as Array<{
                    part_id: number;
                    branded_part_id: number;
                    attachment_point_id: number;
                    owner_id: number;
                    part_name: string | null;
                    repair_cost: number;
                    scrap_value: number;
                }>) {
                    cars.push({
                        partId: part.part_id,
                        parentPartId: null,
                        brandedPartId: part.branded_part_id,
                        percentDamage: 0,
                        itemWear: 0,
                        attachmentPointId: part.attachment_point_id,
                        ownerId: part.owner_id,
                        partName: part.part_name ?? "",
                        repairCost: part.repair_cost,
                        scrapValue: part.scrap_value,
                    });
                }
                return cars;
            },
        );
    }

    async getVehicleAndParts(vehicleId: number): Promise<VehicleRecord | null> {
        const { pool, sql } = await this.ensureConnection();

        const rawVehicleRecord = await Sentry.startSpan(
            {
                name: "Get vehicle and parts",
                op: "db.query",
                attributes: {
                    db: "postgres",
                },
            },
            async (): Promise<VehicleRecord> => {
                const vehicle = (await pool.one(sql.typeAlias("vehicleWithOwner")`
                    SELECT v.*, p.owner_id
                    FROM public.vehicle v
                    INNER JOIN public.part p ON p.part_id = v.vehicle_id
                    WHERE v.vehicle_id = ${vehicleId}
                `)) as {
                    vehicle_id: number;
                    skin_id: number;
                    flags: number;
                    class: number;
                    info_setting: number;
                    damage_info: number;
                    owner_id: number;
                };

                if (!vehicle) {
                    log.error(`Vehicle with id ${vehicleId} not found`);
                    throw new Error(`Vehicle with id ${vehicleId} not found`);
                }

                return {
                    vehicleId: vehicle.vehicle_id,
                    skinId: vehicle.skin_id,
                    flags: vehicle.flags,
                    class: vehicle.class,
                    infoSetting: vehicle.info_setting,
                    damageInfo: vehicle.damage_info,
                    ownerId: vehicle.owner_id,
                    parts: [],
                };
            },
        );

        if (!rawVehicleRecord) {
            return null;
        }

        const parts = await Sentry.startSpan(
            {
                name: "Get vehicle parts",
                op: "db.query",
                attributes: {
                    db: "postgres",
                },
            },
            async (): Promise<PartEntry[]> => {
                const partList: PartEntry[] = [];
                const rawParts = (await pool.many(sql.typeAlias("part")`
                    SELECT *
                    FROM part p1
                    INNER JOIN part p2 ON p1.part_id = p2.parent_part_id
                    WHERE p1.part_id = ${vehicleId} OR p1.parent_part_id = ${vehicleId}
                `)) as Array<{
                    part_id: number;
                    parent_part_id: number;
                    branded_part_id: number;
                    percent_damage: number;
                    item_wear: number;
                    attachment_point_id: number;
                    owner_id: number;
                    part_name: string | null;
                    repair_cost: number;
                    scrap_value: number;
                }>;

                for (const rawPart of rawParts) {
                    partList.push({
                        partId: rawPart.part_id,
                        parentPartId: rawPart.parent_part_id,
                        brandedPartId: rawPart.branded_part_id,
                        percentDamage: rawPart.percent_damage,
                        itemWear: rawPart.item_wear,
                        attachmentPointId: rawPart.attachment_point_id,
                        ownerId: rawPart.owner_id,
                        partName: rawPart.part_name ?? "",
                        repairCost: rawPart.repair_cost,
                        scrapValue: rawPart.scrap_value,
                    });
                }
                return partList;
            },
        );

        rawVehicleRecord.parts = parts;
        return rawVehicleRecord;
    }

    async createNewCar(
        brandedPartId: number,
        skinId: number,
        ownerId: number,
    ): Promise<number> {
        const { pool, sql } = await this.ensureConnection();

        // Check if skin exists
        const skinExists = await Sentry.startSpan(
            {
                name: "skinExists",
                op: "db.query",
                attributes: {
                    db: "postgres",
                },
            },
            async () => {
                return pool.exists(sql.typeAlias("id")`
                    SELECT 1 FROM pt_skin WHERE skin_id = ${skinId}
                `);
            },
        );

        if (!skinExists) {
            log.error("skin does not exist");
            throw new Error("skin does not exist");
        }

        // Check if branded part is a vehicle (abstract_part_type_id === 101)
        const abstractPartTypeId = await Sentry.startSpan(
            {
                name: "GetAbstractPartTypeIDForBrandedPartID",
                op: "db.query",
                attributes: {
                    db: "postgres",
                },
            },
            async () => {
                const result = (await pool.one(sql.typeAlias("abstractPartType")`
                    SELECT pt.abstract_part_type_id
                    FROM branded_part bp
                    INNER JOIN part_type pt ON bp.part_type_id = pt.part_type_id
                    WHERE bp.branded_part_id = ${brandedPartId}
                `)) as { abstract_part_type_id: number };
                return result.abstract_part_type_id;
            },
        );

        if (abstractPartTypeId !== 101) {
            log.error("branded part is not a vehicle", {
                brandedPartId,
                abstractPartTypeId,
            });
            throw new Error(
                `branded part with id ${brandedPartId} and abstract part type id ${abstractPartTypeId} is not a vehicle`,
            );
        }

        const vehicle = await buildVehiclePartTree({
            brandedPartId,
            skinId,
            ownedLotId: 6,
            ownerID: ownerId,
            isStock: true,
        });

        log.verbose("vehicle", { vehicle });

        await saveVehicle(vehicle);
        await saveVehiclePartTree(vehicle);

        return vehicle.vehicleId;
    }

    async purchaseCar(
        playerId: number,
        dealerId: number,
        brandedPartId: number,
        skinId: number,
        tradeInCarId: number,
    ): Promise<number> {
        try {
            log.verbose(
                `Player ${playerId} is purchasing car from dealer ${dealerId} with branded part ${brandedPartId} and skin ${skinId} and trading in car ${tradeInCarId}`,
            );

            if (dealerId === 6) {
                // This is a new stock car and likely does not exist in the server yet
                // We need to create the car and add it to the player's lot
                const newCarId = await this.createNewCar(
                    brandedPartId,
                    skinId,
                    playerId,
                );

                log.verbose(`Player ${playerId} purchased car with ID ${newCarId}`);
                return newCarId;
            }

            const parts = await buildVehiclePartTree({
                brandedPartId,
                skinId,
                isStock: true,
                ownedLotId: dealerId,
                ownerID: playerId,
            });

            log.verbose(`Built vehicle part tree for player ${playerId}`, {
                parts,
            });

            return 1000;
        } catch (error) {
            log.error(`Error purchasing car for player ${playerId}`, { error });
            throw error;
        }
    }
}
