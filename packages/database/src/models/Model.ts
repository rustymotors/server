import { DataTypes, Model as BaseModel, type InferAttributes } from "sequelize";
import { getDatabase } from "../services/database.js";
import { Brand } from "./Brand.js";

export class Model extends BaseModel<InferAttributes<Model>> {
    declare modelId: number;
    declare brandId: number;
    declare eModel: string;
    declare gModel: string;
    declare fModel: string;
    declare sModel: string;
    declare iModel: string;
    declare jModel: string;
    declare swModel: string;
    declare bModel: string;
    declare eExtraInfo: string;
    declare gExtraInfo: string;
    declare fExtraInfo: string;
    declare sExtraInfo: string;
    declare iExtraInfo: string;
    declare jExtraInfo: string;
    declare swExtraInfo: string;
    declare bExtraInfo: string;
    declare eShortModel: string;
    declare gShortModel: string;
    declare fShortModel: string;
    declare sShortModel: string;
    declare iShortModel: string;
    declare jShortModel: string;
    declare swShortModel: string;
    declare bShortModel: string;
    declare debug_string: string;
    declare debug_sort_string: string;
}

Model.init(
    {
        modelId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        brandId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Brand,
                key: "brandId",
            },
        },
        eModel: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },
        },
        gModel: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },
        },
        fModel: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },
        },
        sModel: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },
        },
        iModel: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },
        },
        jModel: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },
        },
        swModel: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },
        },
        bModel: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },
        },
        eExtraInfo: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },
        },
        gExtraInfo: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },
        },
        fExtraInfo: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },
        },
        sExtraInfo: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },
        },
        iExtraInfo: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },
        },
        jExtraInfo: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },
        },
        swExtraInfo: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },
        },
        bExtraInfo: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },
        },
        eShortModel: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 50],
            },
        },
        gShortModel: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 50],
            },
        },
        fShortModel: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 50],
            },
        },
        sShortModel: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 50],
            },
        },
        iShortModel: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 50],
            },
        },
        jShortModel: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 50],
            },
        },
        swShortModel: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 50],
            },
        },
        bShortModel: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 50],
            },
        },
        debug_string: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 255],
            },
        },
        debug_sort_string: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 50],
            },
        },
    },
    {
        sequelize: getDatabase(),
        modelName: "Model",
        tableName: "models",
        timestamps: false,
        indexes: [
            {
                fields: ["modelId"],
                unique: true,
            },
        ],
    },
);

// Path: packages/database/src/models/Model.ts
