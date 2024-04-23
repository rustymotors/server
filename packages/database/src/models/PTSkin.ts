import { DataTypes, Model, type InferAttributes } from "sequelize";
import { getDatabase } from "../services/database.js";
import { PartType } from "./PartType.js";
import { SkinType } from "./SkinType.js";

export class PTSkin extends Model<InferAttributes<PTSkin>> {
    declare skinId: number;
    declare creatorId: number;
    declare skinTypeId: number;
    declare partTypeId: number;
    declare eSkin: string;
    declare gSkin: string;
    declare fSkin: string;
    declare sSkin: string;
    declare iSkin: string;
    declare jSkin: string;
    declare swSkin: string;
    declare bSkin: string;
    declare price: number;
    declare partFilename: string;
    declare h0: number;
    declare s0: number;
    declare v0: number;
    declare c0: number;
    declare x0: number;
    declare y0: number;
    declare h1: number;
    declare s1: number;
    declare v1: number;
    declare c1: number;
    declare x1: number;
    declare y1: number;
    declare h2: number;
    declare s2: number;
    declare v2: number;
    declare c2: number;
    declare x2: number;
    declare y2: number;
    declare h3: number;
    declare s3: number;
    declare v3: number;
    declare c3: number;
    declare x3: number;
    declare y3: number;
    declare h4: number;
    declare s4: number;
    declare v4: number;
    declare c4: number;
    declare x4: number;
    declare y4: number;
    declare h5: number;
    declare s5: number;
    declare v5: number;
    declare c5: number;
    declare x5: number;
    declare y5: number;
    declare h6: number;
    declare s6: number;
    declare v6: number;
    declare c6: number;
    declare x6: number;
    declare y6: number;
    declare h7: number;
    declare s7: number;
    declare v7: number;
    declare c7: number;
    declare x7: number;
    declare y7: number;
    declare defaultFlag: number;
    declare creatorName: string;
    declare commentText: string;
}

PTSkin.init(
    {
        skinId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        creatorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        skinTypeId: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            references: {
                model: SkinType,
                key: "skinTypeId",
            },
        },
        partTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: PartType,
                key: "partTypeId",
            },
        },
        eSkin: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        gSkin: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fSkin: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        sSkin: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        iSkin: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        jSkin: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        swSkin: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        bSkin: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        partFilename: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        h0: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        s0: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        v0: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        c0: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        x0: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        y0: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        h1: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        s1: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        v1: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        c1: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        x1: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        y1: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        h2: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        s2: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        v2: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        c2: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        x2: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        y2: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        h3: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        s3: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        v3: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        c3: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        x3: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        y3: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        h4: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        s4: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        v4: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        c4: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        x4: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        y4: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        h5: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        s5: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        v5: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        c5: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        x5: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        y5: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        h6: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        s6: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        v6: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        c6: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        x6: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        y6: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        h7: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        s7: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        v7: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        c7: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        x7: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        y7: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        defaultFlag: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        creatorName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        commentText: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize: getDatabase(),
        modelName: "PTSkin",
        tableName: "pt_skins",
        timestamps: false,
        indexes: [
            {
                fields: ["skinId"],
                unique: true,
            },
            {
                fields: ["partTypeId"],
                unique: false,
            },
            {
                fields: ["skinTypeId"],
                unique: false,
            },
        ],
    },
);

// Path: packages/database/src/models/PTSkin.ts
