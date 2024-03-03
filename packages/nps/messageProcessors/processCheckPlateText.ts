import { GameMessage } from "../messageStructs/GameMessage.js";
import { SocketCallback } from "./index.js";
import { getLenString, getNBytes } from "../utils/pureGet.js";
import {
    getUserSessionByConnectionId,
    setUserSession,
} from "../services/session.js";
import { getServerLogger } from "@rustymotors/shared";

const log = getServerLogger();

export async function processCheckPlateText(
    connectionId: string,
    message: GameMessage,
    socketCallback: SocketCallback,
): Promise<void> {
    // This message is only called by debug, so let's sey the clinet version to debug
    const session = await getUserSessionByConnectionId(connectionId);

    if (session) {
        log.info(`Setting client version to debug for ${session.customerId}`);

        session.clientVersion = "debug";
        setUserSession(session);
    }

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
}
