import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database.sqlite",
});
export const Connection = sequelize.define("Connection", {
    customerId: DataTypes.INTEGER,
    connectionId: DataTypes.UUIDV4,
    sessionKey: DataTypes.STRING,
    sKey: DataTypes.STRING,
    contextId: DataTypes.STRING,
});
