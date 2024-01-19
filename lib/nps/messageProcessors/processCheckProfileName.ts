import { get } from "http";
import { BareMessage } from "../messageStructs/BareMessage.js";
import { BareMessageV0 } from "../messageStructs/BareMessageV0.js";
import { SocketCallback } from "./index.js";
import { getLenString, getNBytes } from "../utils/pureGet.js";

export function processCheckProfileName(
    connectionId: string,
    message: BareMessage,
    socketCallback: SocketCallback,
): void {
    const requestBytes = message.toBytes();

    const request = BareMessageV0.fromBytes(requestBytes, requestBytes.length);

    const customerId = request.getData().readUInt32BE(8);

    const requestedPersonaName = getLenString(request.getData(), 12, false);

    console.log(
        `Requested persona name: ${requestedPersonaName} for customer ${customerId}`,
    );

    const response = BareMessageV0.new(0x601);
    response.setMessageLength(4);

    const responseBytes = response.toBytes();

    socketCallback([responseBytes]);
}
