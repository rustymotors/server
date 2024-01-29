import { ISerializable, IMessageHeader, IMessage } from "../types.js";
import { GameMessage } from "../messageStructs/GameMessage.js";
import { SocketCallback } from "./index.js";
import { getLenString, getNBytes } from "../utils/pureGet.js";

export function processCheckProfileName(
    connectionId: string,
    message: GameMessage,
    socketCallback: SocketCallback,
): void {
    const customerId = message.serialize().readUInt32BE(8);

    const requestedPersonaName = getLenString(message.serialize(), 12, false);

    console.log(
        `Requested persona name: ${requestedPersonaName} for customer ${customerId}`,
    );

    const response = new GameMessage(0);
    response.header.setId(0x601);

    const responseBytes = response.serialize();

    socketCallback([responseBytes]);
}
