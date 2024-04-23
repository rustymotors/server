import { DataTypes, Model as BaseModel, type InferAttributes } from "sequelize";
import { getDatabase } from "../services/database.js";

export class Tunable extends BaseModel<InferAttributes<Tunable>> {
    declare clubCreationFee: number;
    declare clubCreationMinLevel: number;
    declare clubOfficerMinLevel: number;
    declare racePPDefeatedOpponent: number;
    declare racePPplaceLost: number;
    declare racePenaltyPerRank: number;
    declare raceBonusPerRank: number;
    declare bonusPerMileSponsored: number;
    declare bonusPerRaceOpen: number;
    declare levelsTuneLog: number;
    declare levelsSlope: number;
    declare levelsOffset: number;
    declare levelsPerRank: number;
    declare maxEZStreetLevel: number;
    declare clubWaitPeriodBetweenClubs: number;
    declare turfwarCaptainBonus: number;
    declare turfwarMemberBonus: number;
    declare topDogBonus: number;
    declare rankAdvancementBonus: number;
    declare ttCashRewardFirst: number;
    declare ttCashRewardSecond: number;
    declare ttCashRewardThird: number;
    declare ttPointRewardFirst: number;
    declare ttPointRewardSecond: number;
    declare ttPointRewardThird: number;
    declare ttArcPointForQualify: number;
    declare ttArcPointFasterIncs: number;
    declare ttArcTimeIncraments: number;
    declare ttArcPointBonusWon: number;
    declare ttSimPointForQualify: number;
    declare ttSimCashForQualify: number;
    declare ttSimPointFasterIncs: number;
    declare ttSimCashFasterIncs: number;
    declare ttSimTimeIncraments: number;
    declare ttSimPointBonusWon: number;
    declare ttSimCashBonusWon: number;
    declare universalRepairCostMod: number;
    declare universalScrapValueMod: number;
    declare adCode1Day: number;
    declare adCode2Days: number;
    declare adCode3Days: number;
    declare adCode4Days: number;
    declare adCode5Days: number;
    declare adCode6Days: number;
    declare adCode7Days: number;
    declare tradeInMod: number;
    declare simStreetMaxWager: number;
    declare pointAward1stPlace: number;
    declare pointAward2ndPlace: number;
    declare pointAward3rdPlace: number;
    declare pointAward4thPlace: number;
    declare pointAward5thPlace: number;
    declare pointAward6thPlace: number;
    declare arcadeRacePointMod: number;
    declare mcotsPollingFrequency: number;
    declare starterCash: number;
    declare enableCheatEmails: number;
    declare salaryPerLevel: number;
    declare clubMaximumMembers: number;
    declare clubRegistrationFee: number;
    declare clubReRegistrationFee: number;
    declare classifiedAdBillRace: number;
    declare classifiedAdBillMaxDays: number;
    declare classifiedAdBillMaxSize: number;
    declare classifiedAdBillMaxPerPersona: number;
    declare papAwardPercentage: number;
}

Tunable.init(
    {
        clubCreationFee: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        clubCreationMinLevel: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        clubOfficerMinLevel: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        racePPDefeatedOpponent: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        racePPplaceLost: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        racePenaltyPerRank: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        raceBonusPerRank: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        bonusPerMileSponsored: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        bonusPerRaceOpen: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        levelsTuneLog: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        levelsSlope: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        levelsOffset: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        levelsPerRank: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        maxEZStreetLevel: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        clubWaitPeriodBetweenClubs: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        turfwarCaptainBonus: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        turfwarMemberBonus: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        topDogBonus: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        rankAdvancementBonus: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ttCashRewardFirst: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ttCashRewardSecond: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ttCashRewardThird: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ttPointRewardFirst: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ttPointRewardSecond: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ttPointRewardThird: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ttArcPointForQualify: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ttArcPointFasterIncs: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ttArcTimeIncraments: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ttArcPointBonusWon: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ttSimPointForQualify: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ttSimCashForQualify: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ttSimPointFasterIncs: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ttSimCashFasterIncs: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ttSimTimeIncraments: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ttSimPointBonusWon: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ttSimCashBonusWon: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        universalRepairCostMod: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        universalScrapValueMod: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        adCode1Day: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        adCode2Days: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        adCode3Days: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        adCode4Days: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        adCode5Days: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        adCode6Days: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        adCode7Days: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        tradeInMod: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        simStreetMaxWager: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        pointAward1stPlace: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        pointAward2ndPlace: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        pointAward3rdPlace: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        pointAward4thPlace: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        pointAward5thPlace: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        pointAward6thPlace: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        arcadeRacePointMod: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        mcotsPollingFrequency: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        starterCash: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        enableCheatEmails: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        salaryPerLevel: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        clubMaximumMembers: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        clubRegistrationFee: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        clubReRegistrationFee: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        classifiedAdBillRace: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        classifiedAdBillMaxDays: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        classifiedAdBillMaxSize: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        classifiedAdBillMaxPerPersona: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        papAwardPercentage: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize: await getDatabase(),
        modelName: "Tunable",
        tableName: "tunables",
        timestamps: false,
    },
);

// Path: packages/database/src/models/Tunable.ts
