import { GenericRequestMessage } from "../GenericRequestMessage.js";

import { OldServerMessage } from "../../../shared/messageFactory.js";
import { MessageHandlerArgs, MessageHandlerResult } from "../handlers.js";
import { GenericReplyMessage } from "../GenericReplyMessage.js";
import { CarInfoMessage } from "../messageStructs/CarInfoMessage.js";
import { Vehicle } from "../../../database/src/models/Vehicle.entity.js";
import { Part } from "../../../database/src/models/Part.entity.js";
import { getAllPartsforCar } from "../../../database/src/functions/getAllPartsforCar.js";
import { VehicleOwner } from "../../../database/src/models/VehicleOwner.entity.js";
import { log } from "../../../shared/log.js";

const DAMAGE_SIZE = 2000;

class VehicleStruct {
    vehicleId: number = 0; // 4 bytes
    skinId: number = 0; // 4 bytes
    flags: number = 0; // 4 bytes
    delta: number = 0; // 4 bytes
    carClass: number = 0; // 1 byte
    damageLength: number = 0; // 2 bytes
    damage: Buffer = Buffer.alloc(0); // buffer, max DAMAGE_SIZE

    serialize() {
        try {
            const buffer = Buffer.alloc(this.size());
            buffer.writeInt32LE(this.vehicleId, 0);  // offset 0
            buffer.writeInt32LE(this.skinId, 4); // offset 4
            buffer.writeInt32LE(this.flags, 8); // offset 8
            buffer.writeInt32LE(this.delta, 12); // offset 12
            buffer.writeInt8(this.carClass, 16); // offset 16
            buffer.writeInt16LE(this.damageLength, 17); // offset 17
            if (this.damageLength > 0) {
                this.damage.copy(buffer, 19); // offset 19
            }
            return buffer;
        } catch (error) {
            log.error(`Error in VehicleStruct.serialize: ${error}`);
            throw error;
        }
    }

    size() {
        return 19 + this.damageLength;
    }
}

class PartStruct {
    partId: number = 0; // 4 bytes
    parentPartId: number = 0; // 4 bytes
    brandedPartId: number = 0; // 4 bytes
    repairCost: number = 0; // 4 bytes
    junkyardValue: number = 0; // 4 bytes
    wear: number = 0; // 4 bytes
    arttachmentPoint: number = 0; // 1 byte
    damage: number = 0; // 1 byte

    serialize() {
        try {
            const buffer = Buffer.alloc(this.size());
            log.debug(`Writing partId: ${this.partId}`);
            buffer.writeInt32LE(this.partId, 0);
            log.debug(`Writing parentPartId: ${this.parentPartId}`);
            buffer.writeInt32LE(this.parentPartId, 4);
            log.debug(`Writing brandedPartId: ${this.brandedPartId}`);
            buffer.writeInt32LE(this.brandedPartId, 8);
            log.debug(`Writing repairCost: ${this.repairCost}`);
            buffer.writeInt32LE(this.repairCost, 12);
            log.debug(`Writing junkyardValue: ${this.junkyardValue}`);
            buffer.writeInt32LE(this.junkyardValue, 16);
            log.debug(`Writing wear: ${this.wear}`);
            buffer.writeInt32LE(this.wear, 20);
            log.debug(`Writing arttachmentPoint: ${this.arttachmentPoint}`);
            buffer.writeInt8(this.arttachmentPoint, 24);
            log.debug(`Writing damage: ${this.damage}`);
            buffer.writeInt8(this.damage, 25);
            return buffer;
        } catch (error) {
            log.error(`Error in PartStruct.serialize: ${error}`);
            throw error;
        }
    }

    size() {
        return 26;
    }

    toString() {
        return `partId: ${this.partId} parentPartId: ${this.parentPartId} brandedPartId: ${this.brandedPartId} repairCost: ${this.repairCost} junkyardValue: ${this.junkyardValue} wear: ${this.wear} arttachmentPoint: ${this.arttachmentPoint} damage: ${this.damage}`;
    }
}

class CarInfoStruct {
    msgNo: number = 0; // 2 bytes
    playerId: number = 0; // 4 bytes
    vehicle: VehicleStruct = new VehicleStruct();
    noOfParts: number = 0; // 2 bytes
    parts: PartStruct[] = [];

    serialize() {
        try {
            const neededSize = 10 + this.vehicle.size() + this.noOfParts * 26;

            log.debug(`Needed size: ${neededSize}`);

            const buffer = Buffer.alloc(neededSize);
            log.debug(`Writing msgNo: ${this.msgNo}`);
            buffer.writeInt16LE(this.msgNo, 0);
            log.debug(`Writing playerId: ${this.playerId}`);
            buffer.writeInt32LE(this.playerId, 2);
            log.debug(`Serializing vehicle`);
            this.vehicle.serialize().copy(buffer, 6);
            log.debug(`Writing noOfParts: ${this.noOfParts}`);
            buffer.writeInt16LE(this.noOfParts, 6 + this.vehicle.size());
            let offset = 8 + this.vehicle.size();
            for (const part of this.parts) {
                log.debug(`Serializing part: ${part}`);
                part.serialize().copy(buffer, offset);
                offset += part.size();
            }
            return buffer;
        } catch (error) {
            log.error(`Error in CarInfoStruct.serialize: ${error}`);
            throw error;
        }
    }

    size() {
        return 10 + this.vehicle.size() + this.noOfParts * this.parts[0].size();
    }

    toString() {
        return `msgNo: ${this.msgNo} playerId: ${this.playerId} vehicle: ${this.vehicle} noOfParts: ${this.noOfParts} parts: ${this.parts}`;
    }
}

type PartAndParent = {
    partId: number;
    parentPartId: number;
};

async function dbGetAllPartsforCar(vehicleId: number): Promise<Part[]> {
    log.debug(`Fetching all parts for vehicleId: ${vehicleId}`);
    const partsTable: Part[] = [];

    const topPart = await Part.findOne({ where: { partId: vehicleId } });

    if (!topPart) {
        throw new Error(`Part not found for partId: ${vehicleId}`);
    }

    log.debug(`Adding topPart: ${topPart.partId} to partsTable`);
    partsTable.push(topPart);

    const childParts = await Part.findAll({
        where: { parentPartId: topPart.partId },
    });

    for (const part of childParts) {
        if (!partsTable.find((p) => p.partId === part.partId)) {
            log.debug(`Adding part: ${part.partId} to partsTable`);
            partsTable.push(part);
        }
    }

    return partsTable;
}

async function dbGetVehicle(vehicleId: number): Promise<Vehicle> {
    const vehicle = await Vehicle.findOne({ where: { VehicleID: vehicleId } });

    if (!vehicle) {
        throw new Error(`Vehicle not found for vehicleId: ${vehicleId}`);
    }

    return vehicle;
}

async function formCarInfoMessage(vehicleId: number): Promise<CarInfoStruct> {
    log.debug(`Fetching car info for vehicleId: ${vehicleId}`);
    const vehicle = await dbGetVehicle(vehicleId);

    const parts = await dbGetAllPartsforCar(vehicleId);

    const owner = await VehicleOwner.findOne({
        where: { vehicleId },
    });

    if (!owner) {
        throw new Error(`Owner not found for vehicleId: ${vehicleId}`);
    }

    const carInfo = new CarInfoStruct();
    carInfo.msgNo = 123; // Success
    log.debug(`Owner: ${owner.currentOwnerId}`);
    carInfo.playerId = owner.currentOwnerId;
    carInfo.vehicle.vehicleId = vehicle.VehicleID;
    log.debug(`Vehicle skinId: ${vehicle.SkinID}`);
    carInfo.vehicle.skinId = vehicle.SkinID;
    log.debug(`Vehicle flags: ${vehicle.Flags}`);
    carInfo.vehicle.flags = vehicle.Flags;
    log.debug(`Vehicle carClass: ${vehicle.Class}`);
    carInfo.vehicle.carClass = vehicle.Class;
    log.debug(`Vehicle damage: ${vehicle.DamageInfo}`);
    carInfo.vehicle.damageLength = vehicle.DamageInfo.length;

    log.debug(`Adding ${parts.length} parts to carInfo message`);
    carInfo.noOfParts = parts.length;

    for (const part of parts) {
        const partStruct = new PartStruct();
        log.debug(`Adding partId: ${part.partId} to carInfo message`);
        partStruct.partId = part.partId;
        log.debug(
            `Adding parentPartId: ${part.parentPartId} to carInfo message`,
        );
        partStruct.parentPartId = part.parentPartId;
        log.debug(
            `Adding brandedPartId: ${part.brandedPartId} to carInfo message`,
        );
        partStruct.brandedPartId = part.brandedPartId;
        partStruct.repairCost = 0; // TODO: Get repair cost
        partStruct.junkyardValue = 0; // TODO: Get junkyard value
        partStruct.wear = part.wear;
        partStruct.arttachmentPoint = part.attachmentPoint;
        partStruct.damage = part.damage;
        carInfo.parts.push(partStruct);
    }

    log.debug(`Returning carInfo: ${carInfo}`);

    return carInfo;
}

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
export async function _getCompleteVehicleInfo({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const getCompleteVehicleInfoMessage = new GenericRequestMessage();
    getCompleteVehicleInfoMessage.deserialize(packet.data);

    log.debug(`Received Message: ${getCompleteVehicleInfoMessage.toString()}`);

    const vehicleId = getCompleteVehicleInfoMessage.data.readInt32LE();
    const delta = getCompleteVehicleInfoMessage.data2.readInt32LE();

    log.debug(`Requesting vehicleId: ${vehicleId} delta: ${delta}`);

    try {
        const carInfo = await formCarInfoMessage(vehicleId);

        const responsePacket = new OldServerMessage();
        responsePacket._header.sequence = packet._header.sequence;
        responsePacket._header.flags = 8;
        responsePacket.setBuffer(carInfo.serialize());

        return { connectionId, messages: [responsePacket] };
    } catch (error) {
        log.error(`Error in Fetching car: ${error}`);
        throw error;
    }
}
