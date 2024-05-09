import { GameMessage } from "../messageStructs/GameMessage.js";
import type { SocketCallback } from "./index.js";
import { getLenString } from "../utils/pureGet.js";
import { getServerLogger } from "../../shared";
import type { UserStatus } from "../messageStructs/UserStatus.js";

const log = getServerLogger();

export async function processCheckPlateText(
    connectionId: string,
    userStatus: UserStatus,
    message: GameMessage,
    socketCallback: SocketCallback,
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

    const response = new GameMessage(0);
    response.header.setId(0x207);

    const responseBytes = response.serialize();

    socketCallback([responseBytes]);
    log.resetName();
    return Promise.resolve();
}
