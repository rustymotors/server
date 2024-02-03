import { Part } from "../../../database/src/models/Part.entity.js";
import { Vehicle } from "../../../database/src/models/Vehicle.entity.js";
import { SerializedBuffer } from "../../../shared/messageFactory.js";

export class CarInfoMessage extends SerializedBuffer {
    msgNo: number; // 2 bytes
    playerId: number; // 4 bytes
    private vehicle: Vehicle;
    noOfParts: number; // 2
    private parts: Part[];

    constructor() {
        super();
        this.msgNo = 0;
        this.playerId = 0;
        this.vehicle = new Vehicle();
        this.noOfParts = 0;
        this.parts = [];
    }

    override size() {
        return 2 
        + 4 
        + this.vehicle.size() 
        + 2 
        + this.parts.length * Part.serializedSize();
    }

    override serialize(): Buffer {
        try {
            const buffer = Buffer.alloc(this.size());
            let offset = 0;
            buffer.writeUInt16LE(this.msgNo, offset);
            offset += 2;
            buffer.writeUInt32LE(this.playerId, offset);
            offset += 4;
            this.vehicle.serialize().copy(buffer, offset);
            offset += this.vehicle.size();
            buffer.writeUInt16LE(this.noOfParts, offset);
            offset += 2;
            for (const part of this.parts) {
                part.serialize().copy(buffer, offset);
                offset += part.size();
            }
            return buffer;
        } catch (error) {
            throw new Error(`Error in CarInfoMessage.serialize: ${error}`);
        }
    }

    public override toString(): string {
        return `CarInfoMessage:
        playerId: ${this.playerId}
        vehicle: ${this.vehicle}
        noOfParts: ${this.noOfParts}
        parts: ${this.parts}`;
    }

    setVehicle(vehicle: Vehicle) {
        this.vehicle = vehicle;
    }

    setParts(parts: Part[]) {
        this.parts = parts;
    }
}
