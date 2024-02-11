import { DataTypes, Model as BaseModel, Optional } from "sequelize";

import { sequelize } from "../services/database.js";

interface IModel {
    ModelID: number;
    BrandID: number;
    EModel: string | null;
    GModel: string | null;
    FModel: string | null;
    SModel: string | null;
    IModel: string | null;
    JModel: string | null;
    SwModel: string | null;
    BModel: string | null;
    EExtraInfo: string | null;
    GExtraInfo: string | null;
    FExtraInfo: string | null;
    SExtraInfo: string | null;
    IExtraInfo: string | null;
    JExtraInfo: string | null;
    SwExtraInfo: string | null;
    BExtraInfo: string | null;
    EShortModel: string | null;
    GShortModel: string | null;
    FShortModel: string | null;
    SShortModel: string | null;
    IShortModel: string | null;
    JShortModel: string | null;
    SwShortModel: string | null;
    BShortModel: string | null;
    Debug_String: string | null;
    Debug_Sort_String: string | null;
}

export class Model extends BaseModel<IModel> {
    declare ModelID: number;
    declare BrandID: number;
    declare EModel: string;
    declare GModel: string;
    declare FModel: string;
    declare SModel: string;
    declare IModel: string;
    declare JModel: string;
    declare SwModel: string;
    declare BModel: string;
    declare EExtraInfo: string;
    declare GExtraInfo: string;
    declare FExtraInfo: string;
    declare SExtraInfo: string;
    declare IExtraInfo: string;
    declare JExtraInfo: string;
    declare SwExtraInfo: string;
    declare BExtraInfo: string;
    declare EShortModel: string;
    declare GShortModel: string;
    declare FShortModel: string;
    declare SShortModel: string;
    declare IShortModel: string;
    declare JShortModel: string;
    declare SwShortModel: string;
    declare BShortModel: string;
    declare Debug_String: string;
    declare Debug_Sort_String: string;
}

Model.init(
    {
        ModelID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        BrandID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Brand",
                key: "BrandID",
            },
        },
        EModel: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        GModel: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        FModel: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        SModel: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        IModel: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        JModel: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        SwModel: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        BModel: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        EExtraInfo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        GExtraInfo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        FExtraInfo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        SExtraInfo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        IExtraInfo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        JExtraInfo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        SwExtraInfo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        BExtraInfo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        EShortModel: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        GShortModel: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        FShortModel: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        SShortModel: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        IShortModel: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        JShortModel: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        SwShortModel: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        BShortModel: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        Debug_String: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        Debug_Sort_String: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "Model",
        modelName: "Model",
    },
);
