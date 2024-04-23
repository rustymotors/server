import { DataTypes, Model, type InferAttributes } from "sequelize";
import { getDatabase } from "../services/database.js";

export class AbstractPartType extends Model<InferAttributes<AbstractPartType>> {
    declare abstractPartTypeId: number;
    declare parentAbstractPartTypeId: number | null;
    declare dependsOn: number | null;
    declare partFilename: string | null;
    declare eapt: string | null;
    declare gapt: string | null;
    declare fapt: string | null;
    declare sapt: string | null;
    declare iapt: string | null;
    declare japt: string | null;
    declare swapt: string | null;
    declare bapt: string | null;
    declare modifiedRule: number;
    declare eut: string | null;
    declare gut: string | null;
    declare fut: string | null;
    declare sut: string | null;
    declare iut: string | null;
    declare jut: string | null;
    declare swut: string | null;
    declare but: string | null;
    declare partPared: number;
    declare schematicPicname1: string | null;
    declare schematicPicname2: string | null;
    declare blockFamilyCompatibility: number;
    declare repairCostModifier: number;
    declare scrapValueModifier: number;
    declare garageCategory: number;
}

AbstractPartType.init(
    {
        abstractPartTypeId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        parentAbstractPartTypeId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            references: {
                model: AbstractPartType,
                key: "abstractPartTypeId",
            },
        },
        dependsOn: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            references: {
                model: AbstractPartType,
                key: "abstractPartTypeId",
            },
        },
        partFilename: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 20],
            },            
        },
        eapt: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },            
        },
        gapt: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },            
        },
        fapt: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },            
        },
        sapt: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },            
        },
        iapt: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },            
        },
        japt: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },            
        },
        swapt: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },            
        },
        bapt: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },            
        },
        modifiedRule: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        eut: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        gut: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        fut: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        sut: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        iut: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        jut: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        swut: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        but: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        partPared: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        schematicPicname1: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 9],
            },            
        },
        schematicPicname2: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 9],
            },            
        },
        blockFamilyCompatibility: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        repairCostModifier: {
            type: DataTypes.DECIMAL(100, 7),
            defaultValue: 0,
        },
        scrapValueModifier: {
            type: DataTypes.DECIMAL(100, 7),
            defaultValue: 0,
        },
        garageCategory: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        sequelize: getDatabase(),
        modelName: "AbstractPartType",
        tableName: "abstract_part_types",
        timestamps: false,
        indexes: [
            {
                fields: ["abstractPartTypeId"],
                unique: true,                
            },
            {
                fields: ["parentAbstractPartTypeId"],
            },
            {
                fields: ["dependsOn"],
            }
        ],
    },
);

// Path: packages/database/src/models/AbstractPartType.ts
