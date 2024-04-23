import { DataTypes, Model as BaseModel, type InferAttributes } from "sequelize";
import { getDatabase } from "../services/database.js";

export class NextPartSeq extends BaseModel<InferAttributes<NextPartSeq>> {
    declare nextPartSeqId: number;

    static async getNextPartSeq(): Promise<number> {
        const seq = await this.findOne().then((seq) => seq?.nextPartSeqId);

        if (seq === undefined) {
            throw new Error("NextPartSeq not found");
        }

        return seq;
    }
}

NextPartSeq.init(
    {
        nextPartSeqId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            defaultValue: 1,
            autoIncrement: true,
            get() {
                const value = this.getDataValue("nextPartSeqId");
                this.setDataValue("nextPartSeqId", value + 1);
                return value;
            },
        },
    },
    {
        sequelize: getDatabase(),
        modelName: "NextPartSeq",
        tableName: "next_part_seqs",
        timestamps: false,
        
    },
);
