import { DataTypes, Model, Optional } from "sequelize";

import { sequelize } from "../services/database.js";

interface IPlayer {
    playerId: number; // int
    customerId: number; // int
    playerTypeId: number; // int
    stockClassicClass: string; // varchar
    stockMuscleClass: string; // varchar
    ModifiedClassicClass: string; // varchar
    ModifiedMuscleClass: string; // varchar
    outlawClass: string; // varchar
    dragClass: string; // varchar
    challengeScore: number; // int
    challengeRung: number; // int
    lastLogin: Date; // datetime
    totalTimePlayed: Date; // time
    timesLoggedIn: number; // smallint
    numUnreadMessages: number; // smallint
    bankBalance: number; // int
    numberOfCars: number; // smallint
    isLoggedOn: boolean; // tinyint
    driverStyle: number; // tinyint
    lpCode: number; // smallint
    carInfoSetting: number; // int
    carNumber1: string; // varchar(2)
    carNumber2: string; // varchar(2)
    carNumber3: string; // varchar(2)
    carNumber4: string; // varchar(2)
    carNumber5: string; // varchar(2)
    carNumber6: string; // varchar(2)
    lpText: string; // varchar(8)
    dlNumber: string; // varchar(20)
    persona: string; // varchar(30)
    address: string; // varchar(128)
    residence: string; // varchar(20)
}

export type PlayerCreationAttributes = Optional<IPlayer, "playerId">;

export class Player extends Model<IPlayer, PlayerCreationAttributes> {
    declare playerId: number;
    declare customerId: number;
    declare playerTypeId: number;
    declare stockClassicClass: string;
    declare stockMuscleClass: string;
    declare ModifiedClassicClass: string;
    declare ModifiedMuscleClass: string;
    declare outlawClass: string;
    declare dragClass: string;
    declare challengeScore: number;
    declare challengeRung: number;
    declare lastLogin: Date;
    declare totalTimePlayed: Date;
    declare timesLoggedIn: number;
    declare numUnreadMessages: number;
    declare bankBalance: number;
    declare numberOfCars: number;
    declare isLoggedOn: boolean;
    declare driverStyle: number;
    declare lpCode: number;
    declare carInfoSetting: number;
    declare carNumber1: string;
    declare carNumber2: string;
    declare carNumber3: string;
    declare carNumber4: string;
    declare carNumber5: string;
    declare carNumber6: string;
    declare lpText: string;
    declare dlNumber: string;
    declare persona: string;
    declare address: string;
    declare residence: string;
}

Player.init(
    {
        playerId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        customerId: {
            type: DataTypes.INTEGER,
        },
        playerTypeId: {
            type: DataTypes.INTEGER,
        },
        stockClassicClass: {
            type: DataTypes.STRING,
        },
        stockMuscleClass: {
            type: DataTypes.STRING,
        },
        ModifiedClassicClass: {
            type: DataTypes.STRING,
        },
        ModifiedMuscleClass: {
            type: DataTypes.STRING,
        },
        outlawClass: {
            type: DataTypes.STRING,
        },
        dragClass: {
            type: DataTypes.STRING,
        },
        challengeScore: {
            type: DataTypes.INTEGER,
        },
        challengeRung: {
            type: DataTypes.INTEGER,
        },
        lastLogin: {
            type: DataTypes.DATE,
        },
        totalTimePlayed: {
            type: DataTypes.TIME,
        },
        timesLoggedIn: {
            type: DataTypes.SMALLINT,
        },
        numUnreadMessages: {
            type: DataTypes.SMALLINT,
        },
        bankBalance: {
            type: DataTypes.INTEGER,
        },
        numberOfCars: {
            type: DataTypes.SMALLINT,
        },
        isLoggedOn: {
            type: DataTypes.TINYINT,
        },
        driverStyle: {
            type: DataTypes.TINYINT,
        },
        lpCode: {
            type: DataTypes.SMALLINT,
        },
        carInfoSetting: {
            type: DataTypes.INTEGER,
        },
        carNumber1: {
            type: DataTypes.STRING,
        },
        carNumber2: {
            type: DataTypes.STRING,
        },
        carNumber3: {
            type: DataTypes.STRING,
        },
        carNumber4: {
            type: DataTypes.STRING,
        },
        carNumber5: {
            type: DataTypes.STRING,
        },
        carNumber6: {
            type: DataTypes.STRING,
        },
        lpText: {
            type: DataTypes.STRING,
        },
        dlNumber: {
            type: DataTypes.STRING,
        },
        persona: {
            type: DataTypes.STRING,
        },
        address: {
            type: DataTypes.STRING,
        },
        residence: {
            type: DataTypes.STRING,
        },
    },
    {
        sequelize,
        tableName: "players",
        modelName: "player",
    },
);
