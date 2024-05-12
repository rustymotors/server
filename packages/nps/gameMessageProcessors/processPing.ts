import { GameMessage } from "../messageStructs/GameMessage.js";
import type { GameSocketCallback } from "./index.js";

import { getServerLogger } from "rusty-motors-shared";
import type { UserStatus } from "../messageStructs/UserStatus.js";
import { sendNPSAck } from "../src/utils/sendNPSAck.js";

const log = getServerLogger();

export async function processPing(
    connectionId: string,
    userStatus: UserStatus,
    message: GameMessage,
    socketCallback: GameSocketCallback,
): Promise<void> {
    log.setName("nps:processPing");
    log.info(`Ping: ${message.toString()}`);

    sendNPSAck(socketCallback);
    log.resetName();
    return Promise.resolve();

}
