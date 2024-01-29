import { OldServerMessage } from "../../../shared/messageFactory.js";
import { PartModel } from "../models/PartModel.js";

export class Vehicle {
    private vehicleId = 0; // 4 bytes
    private skinId = 0; // 4 bytes
    private flags = 0; // 4 bytes
    private delta = 0; // 4 bytes
    private carClass = 0; // 1 byte
    private damageLength = 0; // 2 bytes
    private damage = 0; // 1 byte / max 2000
}

export class CarInfoMessage extends OldServerMessage {
    private playerId = 0;
    private vehicle: Vehicle = new Vehicle();
    private noOfParts = 0;
    private parts: PartModel[] = [];

    constructor() {
        super();
    }

    override size() {
        return 10;
    }

    public toBytes(buffer: Buffer) {
        let offset = 0;
        this._header._doDeserialize(buffer);
        offset += this._header._size;
        this._msgNo = buffer.readUInt16LE(offset);
        offset += 2;
    }

    public override toString(): string {
        return `CarInfoMessage:
        playerId: ${this.playerId}
        vehicle: ${this.vehicle}
        noOfParts: ${this.noOfParts}
        parts: ${this.parts}`;
    }
}
