import { GameMessage } from "../messageStructs/GameMessage.js";
import type { GameSocketCallback } from "./index.js";
import { getLenString } from "../src/utils/pureGet.js";
import { getServerLogger } from "rusty-motors-shared";
import type { UserStatus } from "../messageStructs/UserStatus.js";
import { sendNPSAck } from "../src/utils/sendNPSAck.js";

const log = getServerLogger();

export async function processCheckPlateText(
    connectionId: string,
    userStatus: UserStatus,
    message: GameMessage,
    socketCallback: GameSocketCallback,
): Promise<void> {
    log.setName("nps:processCheckPlateText");

    const plateType = message.getDataAsBuffer().readUInt32BE(0);

    const requestedPlateText = getLenString(
        message.getDataAsBuffer(),
        4,
        false,
    );

    log.info(
        `Requested plate text: ${requestedPlateText} for plate type ${plateType}`,
    );

    sendNPSAck(socketCallback);
    log.resetName();
    return Promise.resolve();
}
