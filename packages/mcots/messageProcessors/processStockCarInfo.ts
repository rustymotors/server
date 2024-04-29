import { ServerGenericRequest, type ServerMessage } from "../../shared-packets/src/ServerMessage";
import type { SocketCallback } from ".";
import { getServerLogger } from "../../shared";

const log = getServerLogger();

// 1300 544f4d43 01 00000000 8d00 [08000000 00000000]

export function processStockCarInfo(connectionId: string, message: ServerMessage, socketCallback: SocketCallback): Promise<void> {
    log.setName("processStockCarInfo");

    log.debug(`Processing stock car info message`);

    const request = new ServerGenericRequest().deserialize(message.data.serialize());

    log.debug(`Received stock car info request: ${request.toString()}`);

    const lotOwnerId = request.getData().readUInt32LE(0x0);
    const brandId = request.getData().readUInt32LE(0x4);

    log.resetName();
    return Promise.resolve();
}

// Path: packages/mcots/messageProcessors/processStockCarInfo.ts
