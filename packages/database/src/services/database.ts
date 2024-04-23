import { Sequelize } from "sequelize";
import { PTSkin } from "../models/PTSkin";
import { SkinType } from "../models/SkinType";
import { PartType } from "../models/PartType";
import { AbstractPartType } from "../models/AbstractPartType";
import { PartGrade } from "../models/PartGrade";

let database: Sequelize;

export function getDatabase(): Sequelize {
    if (!database) {
        database = new Sequelize("postgres://user:password@localhost:5432/rm");
    }
    return database;
}

export async function createDatabase() {
    await SkinType.sync();
    await AbstractPartType.sync();
    await PartGrade.sync();
    await PartType.sync();
    await PTSkin.sync();
}

export async function populateDatabase() {
    await Promise.all([]);
}
