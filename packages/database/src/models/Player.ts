import { DataTypes, Model, type InferAttributes } from "sequelize";
import { getDatabase } from "../services/database.js";
import { DriverClass } from "./DriverClass.js";
import { PlayerType } from "./PlayerType.js";

export class Player extends Model<InferAttributes<Player>> {
    declare playerId: number;
    declare customerId: number;
    declare sanctionedScore: number | null;
    declare challengeScore: number | null;
    declare lastLoggedIn: Date | null;
    declare timesLoggedIn: number | null;
    declare bankBalance: number | null;
    declare numCarsOwned: number | null;
    declare isLoggedIn: boolean | null;
    declare driverStyle: string;
    declare lpCode: string;
    declare lpText: string;
    declare carNum1: number;
    declare carNum2: number;
    declare carNum3: number;
    declare carNum4: number;
    declare carNum5: number;
    declare carNum6: number;
    declare dlNumber: string;
    declare persona: string;
    declare address: string;
    declare residence: string;
    declare vehicleId: number;
    declare currentRaceId: number;
    declare offlineDriverSkill: number;
    declare offlineGrudge: number;
    declare offlineReputation: number;
    declare totalTimePlayed: number;
    declare carInfoSetting: number;
    declare stockClassicClass: number;
    declare stockMuscleClass: number;
    declare modifiedClassicClass: number;
    declare modifiedMuscleClass: number;
    declare outlawClass: number;
    declare dragClass: number;
    declare challengeRung: number;
    declare offlineAiCareClass: number;
    declare offlineAiSkinId: number;
    declare offlineAiCarBptId: number;
    declare offlineAiState: number;
    declare bodyType: number;
    declare skinColor: string;
    declare hairColor: string;
    declare shirtColor: string;
    declare pantsColor: string;
    declare offlineDriverStyle: number;
    declare offlineDriverAttitude: number;
    declare evadedFuzz: number;
    declare pinksWon: number;
    declare numUnreadMail: number;
    declare totalRacesRun: number;
    declare totalRacesWon: number;
    declare totalRacesCompleted: number;
    declare totalWinnings: number;
    declare insuranceRiskPoints: number;
    declare insuranceRating: number;
    declare challengeRacesRun: number;
    declare challengeRacesWon: number;
    declare challengeRacesCompleted: number;
    declare carsLost: number;
    declare carsWon: number;
}


Player.init(
    {
        playerId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        sanctionedScore: {
            type: DataTypes.INTEGER
        },
        challengeScore: {
            type: DataTypes.INTEGER
        },
        lastLoggedIn: {
            type: DataTypes.DATE
        },
        timesLoggedIn: {
            type: DataTypes.INTEGER
        },
        bankBalance: {
            type: DataTypes.DECIMAL
        },
        numCarsOwned: {
            type: DataTypes.INTEGER
        },
        isLoggedIn: {
            type: DataTypes.BOOLEAN
        },
        driverStyle: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 50],
            },
        },
        lpCode: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 50],
            },
        },
        lpText: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 50],
            },
        },
        carNum1: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        carNum2: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        carNum3: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        carNum4: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        carNum5: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        carNum6: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        dlNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 50],
            },
        },
        persona: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 50],
            },
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 50],
            },
        },
        residence: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 50],
            },
        },
        vehicleId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        currentRaceId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        offlineDriverSkill: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        offlineGrudge: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        offlineReputation: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        totalTimePlayed: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        carInfoSetting: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        stockClassicClass: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        stockMuscleClass: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        modifiedClassicClass: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        modifiedMuscleClass: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        outlawClass: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        dragClass: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        challengeRung: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        offlineAiCareClass: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        offlineAiSkinId: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        offlineAiCarBptId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        offlineAiState: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        bodyType: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        skinColor: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 7],
            },
        },
        hairColor: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 7],
            },
        },
        shirtColor: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 7],
            },
        },
        pantsColor: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 7],
            },
        },
        offlineDriverStyle: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        offlineDriverAttitude: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        evadedFuzz: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        pinksWon: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        numUnreadMail: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        totalRacesRun: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        totalRacesWon: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        totalRacesCompleted: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        totalWinnings: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        insuranceRiskPoints: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        insuranceRating: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        challengeRacesRun: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        challengeRacesWon: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        challengeRacesCompleted: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        carsLost: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        carsWon: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        }
    },
    {
        sequelize: await getDatabase(),
        modelName: "Player",
        tableName: "players",
        timestamps: false,
        indexes: [
            {
                fields: ["playerId"],
                unique: true,
            },
            {
                fields: ["numUnreadMail"],
            },
            {
                fields: ["offlineAiCarBptId"],
            },
            {
                fields: ["stockMuscleClass"],
            },
            {
                fields: ["modifiedClassicClass"],
            },
            {
                fields: ["outlawClass"],
            },
            {
                fields: ["dragClass"],
            },
        ],
    },
);

Player.hasOne(DriverClass, {
    foreignKey: "driverClassId",
    as: "stockMuscleClass",
});

Player.hasOne(DriverClass, {
    foreignKey: "driverClassId",
    as: "modifiedClassicClass",
});

Player.hasOne(DriverClass, {
    foreignKey: "driverClassId",
    as: "modifiedMuscleClass",
});

Player.belongsTo(DriverClass, {
    foreignKey: "driverClassId",
    targetKey: "outlawClass",
});

Player.belongsTo(DriverClass, {
    foreignKey: "driverClassId",
    targetKey: "dragClass",
});

Player.belongsTo(PlayerType, {
    foreignKey: "playerTypeId",
    targetKey: "playerTypeId",
});

// Path: packages/database/src/models/Player.ts
