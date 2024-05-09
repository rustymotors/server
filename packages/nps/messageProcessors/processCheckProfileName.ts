import { GameMessage } from "../messageStructs/GameMessage.js";
import type { SocketCallback } from "./index.js";
import { getLenString  } from "../utils/pureGet.js";

import { getServerLogger } from "../../shared";
import type { UserStatus } from "../messageStructs/UserStatus.js";

const log = getServerLogger();

export async function processCheckProfileName(
    connectionId: string,
    userStatus: UserStatus,
    message: GameMessage,
    socketCallback: SocketCallback,
): Promise<void> {
    log.setName("nps:processCheckProfileName");
    const customerId = message.serialize().readUInt32BE(8);

    const requestedPersonaName = getLenString(message.serialize(), 12, false);

    log.info(
        `Requested persona name: ${requestedPersonaName} for customer ${customerId}`,
    );

    const response = new GameMessage(0);
    response.header.setId(0x601);

    const responseBytes = response.serialize();

    socketCallback([responseBytes]);
    log.resetName();
    return Promise.resolve();
}
