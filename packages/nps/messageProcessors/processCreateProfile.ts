import { GameMessage } from "../messageStructs/GameMessage.js";
import { SocketCallback } from "./index.js";
import { GameProfile } from "../messageStructs/GameProfile.js";

import { getServerLogger } from "@rustymotors/shared";

const log = getServerLogger();

export async function processCreateProfile(
    connectionId: string,
    message: GameMessage,
    socketCallback: SocketCallback,
): Promise<void> {
    // Log the request
    log.info(`ProcessCreateProfile request: ${message.toString()}`);

    const createProfileMessage = GameProfile.fromBytes(
        message.getDataAsBuffer(),
        message.getData().getByteSize(),
    );

    // Log the request
    log.info(
        `ProcessCreateProfile request: ${createProfileMessage.toString()}`,
    );

    // TODO: Create the profile

    // TODO: Send the response
    const response = new GameMessage(257);
    response.header.setId(0x601);

    response.setData(message.getData());

    // Log the response
    log.info(`ProcessCreateProfile response: ${response.toString()}`);

    socketCallback([response.serialize()]);
}
