import { getServerLogger } from "rusty-motors-shared"
import { getDatabase } from "../services/database.js"

const log = getServerLogger("db/player")

// Lazy initialization - only connect when needed
let slonik: Awaited<ReturnType<typeof getDatabase>>["slonik"] | null = null;
let sql: Awaited<ReturnType<typeof getDatabase>>["sql"] | null = null;

async function ensureDatabase() {
    if (!slonik || !sql) {
        const db = await getDatabase();
        slonik = db.slonik;
        sql = db.sql;
    }
    return { slonik, sql };
}

export async function getPlayer(player_id: number) {
    const { slonik, sql } = await ensureDatabase();
    try {
        const player = await slonik.one(sql.typeAlias('player')`
            SELECT * 
            FROM player
            WHERE player_id = ${player_id}
        `) as Player

        return player
    } catch (error) {
        log.error(`Error fetching player: ${String(error)}`)
        throw error
    }
}

export type Player = {
    player_id: number,
    customer_id: number,
    player_type_id: number,
    sanctioned_scole: number,
    challenge_score: number,
    last_logged_in: number,
    times_logged_in: number,
    bank_balance: number,
    num_cars_owned: number,
    driver_style: number,
    lp_code: number,
    lp_text: string,
    car_num1: string,
    car_num2: string,
    car_num3: string,
    car_num4: string,
    car_num5: string,
    dd_number: string,
    persona: string,
    address: string,
    residence: string,
    vehicle_id: number,
    current_race_id: number,
    offline_driver_skill: number,
    offline_grudge: number,
    offline_reputation: number,
    total_time_played: number,
    car_info_setting: number,
    stock_classic_class: number,
    stock_muscle_class: number,
    modified_classic_class: number,
    modified_muscle_class: number,
    outlaw_class: number,
    drag_class: number,
    challenge_rung: number,
    offline_ai_car_class: number,
    offline_ai_car_bpt_id: number,
    offline_state: number,
    body_type: number,
    skin_color: number,
    hair_color: number,
    shirt_xolor: number,
    parts_color: number,
    offline_driver_style: number,
    offline_driver_attitude: number,
    evaded_fuzz: number,
    pinks_won: number,
    num_unread_mail: number,
    total_races_won: number,
    total_races_completed: number,
    total_winnings: number,
    insurance_risk_points: number,
    insurence_rating: number,
    challenge_races_run: number,
    challenge_races_won: number,
    challenge_raced_completed: number,
    cars_lost: number,
    cars_won: number
}