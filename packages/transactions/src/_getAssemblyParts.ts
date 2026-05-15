import {
    fetchStateFromDatabase,
    findSessionByConnectionId,
} from "rusty-motors-shared";
import { OldServerMessage } from "rusty-motors-shared";
import { GenericRequestMessage } from "./GenericRequestMessage.js";
import { PartsAssemblyMessage, Part } from "./PartsAssemblyMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "./types.js";
import { getServerLogger } from "rusty-motors-shared";
import { buildAssemblyPartTreeFromDB } from "rusty-motors-database";
import type { TPart } from "rusty-motors-database";

const defaultLogger = getServerLogger("handlers/_getAssemblyParts");

function tPartToPart(tPart: TPart): Part {
    const part = new Part();
    part._partId = tPart.part_id;
    part._parentPartId = tPart.parent_part_id ?? 0;
    part._brandedPartId = tPart.branded_part_id;
    part._repairPrice = tPart.repair_cost;
    part._junkPrice = tPart.scrap_value;
    part._wear = tPart.item_wear;
    part._attachmentPoint = tPart.attachment_point_id ?? 0;
    part._damage = tPart.percent_damage;
    return part;
}

export async function _getAssemblyParts({
    connectionId,
    packet,
    log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const msg = new GenericRequestMessage();
    msg.deserialize(packet.data);

    log.debug(`Received Message: ${msg.toString()}`);

    const vehicleId = msg.data.readUInt32LE(0);

    const state = fetchStateFromDatabase();
    const session = findSessionByConnectionId(state, connectionId);

    if (!session) {
        throw Error("Session not found");
    }

    let partTree;
    try {
        partTree = await buildAssemblyPartTreeFromDB(vehicleId);
    } catch (err) {
        log.warn(`Part ${vehicleId} not found in DB, sending bare root: ${err}`);
        partTree = null;
    }

    const assemblyMessage = new PartsAssemblyMessage(session.gameId);
    assemblyMessage._msgNo = 184;

    const rootPart = new Part();
    rootPart._partId = vehicleId;
    rootPart._parentPartId = 0;
    rootPart._brandedPartId = partTree?.brandedPartId ?? 0;
    rootPart._repairPrice = partTree?.rootRepairPrice ?? 0;
    rootPart._junkPrice = partTree?.rootJunkPrice ?? 0;
    rootPart._wear = partTree?.rootWear ?? 0;
    rootPart._attachmentPoint = partTree?.rootAttachmentPoint ?? 0;
    rootPart._damage = partTree?.rootDamage ?? 0;

    const parts: Part[] = [rootPart];
    if (partTree !== null) {
        for (const p of partTree.partTree.level1.parts) {
            parts.push(tPartToPart(p));
        }
        for (const p of partTree.partTree.level2.parts) {
            parts.push(tPartToPart(p));
        }
    }

    assemblyMessage._partList = parts;
    assemblyMessage._numberOfParts = parts.length;

    log.debug(`Returning ${parts.length} assembly parts for part ${vehicleId}`);

    const responsePacket = new OldServerMessage();
    responsePacket._header.sequence = packet.sequenceNumber;
    responsePacket._header.flags = 8;

    responsePacket.setBuffer(assemblyMessage.serialize());

    return { connectionId, messages: [responsePacket] };
}


