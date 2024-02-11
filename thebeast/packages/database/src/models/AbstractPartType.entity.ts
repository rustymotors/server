import { DataTypes, Model, Optional } from "sequelize";

import { sequelize } from "../services/database.js";

interface IAbstractPartType {
    abstractPartTypeId: number; // 4 bytes
    parentAbstractPartTypeId: number; // 4 bytes
    dependsOn: number; // 4 bytes
    partFilename: string; // Not serialized
    eapt: string; // Not serialized
    gapt: string; // Not serialized
    faft: string; // Not serialized
    saft: string; // Not serialized
    taft: string; // Not serialized
    swaft: string; // Not serialized
    baft: string; // Not serialized
    modifiedRule: number; // 4 bytes
    eut: string; // Not serialized
    gut: string; // Not serialized
    fut: string; // Not serialized
    sut: string; // Not serialized
    iut: string; // Not serialized
    jut: string; // Not serialized
    swut: string; // Not serialized
    but: string; // Not serialized
    partPared: string; // Not serialized
    schematicPicname1: string; // Not serialized
    schematicPicname2: string; // Not serialized
    blockFamilyCompatibility: string; // Not serialized
    repairCostModifier: number; // 4 bytes
    scrapCostModifier: number; // 4 bytes
    garageCategory: number; // 4 bytes
}

export type AbstractPartTypeCreationAttributes = Optional<
    IAbstractPartType,
    "abstractPartTypeId"
>;

export class AbstractPartType extends Model<
    IAbstractPartType,
    AbstractPartTypeCreationAttributes
> {
    declare abstractPartTypeId: number;
    declare parentAbstractPartTypeId: number;
    declare dependsOn: number;
    declare partFilename: string;
    declare eapt: string;
    declare gapt: string;
    declare faft: string;
    declare saft: string;
    declare taft: string;
    declare swaft: string;
    declare baft: string;
    declare modifiedRule: number;
    declare eut: string;
    declare gut: string;
    declare fut: string;
    declare sut: string;
    declare iut: string;
    declare jut: string;
    declare swut: string;
    declare but: string;
    declare partPared: string;
    declare schematicPicname1: string;
    declare schematicPicname2: string;
    declare blockFamilyCompatibility: string;
    declare repairCostModifier: number;
    declare scrapCostModifier: number;
    declare garageCategory: number;
}

AbstractPartType.init(
    {
        abstractPartTypeId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
        },
        parentAbstractPartTypeId: {
            type: DataTypes.INTEGER,
            references: {
                model: "abstract_part_type",
                key: "abstractPartTypeId",
            },
        },
        dependsOn: {
            type: DataTypes.INTEGER,
            references: {
                model: "abstract_part_type",
                key: "abstractPartTypeId",
            },
        },
        partFilename: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        eapt: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        gapt: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        faft: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        saft: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        taft: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        swaft: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        baft: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        modifiedRule: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        eut: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        gut: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fut: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        sut: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        iut: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        jut: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        swut: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        but: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        partPared: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        schematicPicname1: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        schematicPicname2: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        blockFamilyCompatibility: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        repairCostModifier: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        scrapCostModifier: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        garageCategory: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "abstract_part_type",
        modelName: "abstractPartType",
    },
);
