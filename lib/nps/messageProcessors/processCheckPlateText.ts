import { get } from "http";
import { BareMessage } from "../messageStructs/BareMessage.js";
import { BareMessageV0 } from "../messageStructs/BareMessageV0.js";
import { SocketCallback } from "./index.js";
import { getLenString, getNBytes } from "../utils/pureGet.js";
import { getUserSessionByConnectionId, setUserSession } from "../services/session.js";

export function processCheckPlateText(
    connectionId: string,
    message: BareMessage,
    socketCallback: SocketCallback,
): void {
    // This message is only called by debug, so let's sey the clinet version to debug
    const session = getUserSessionByConnectionId(connectionId);

    if (session) {
        console.log(`Setting client version to debug for ${session.customerId}`);

        session.clientVersion = "debug";
        setUserSession(session);
    }

    const requestBytes = message.toBytes();

    const request = BareMessage.fromBytes(requestBytes, requestBytes.length);

    const plateType = request.getData().readUInt32BE(0);

    const requestedPlateText = getLenString(request.getData(), 4, false);

    console.log(
        `Requested plate text: ${requestedPlateText} for plate type ${plateType}`,
    );

    const response = BareMessageV0.new(0x207);
    response.setMessageLength(4);

    const responseBytes = response.toBytes();

    socketCallback([responseBytes]);
}
