import { get } from "http";
import { BareMessage, BareMessageV0 } from "../BareMessage.js";
import { SocketCallback } from "./index.js";
import { getLenString, getNBytes } from "../pureGet.js";

export function processCheckProfileName(
    connectionId: string,
    message: BareMessage,
    socketCallback: SocketCallback,
): void {

    const requestBytes = message.toBytes();

    const request = BareMessageV0.fromBytes(requestBytes, requestBytes.length);

    const customerId = request.getData().readUInt32BE(8);

    const requestedPersonaName = getLenString(request.getData(), 12, false);

    console.log(`Requested persona name: ${requestedPersonaName} for customer ${customerId}`);

    const response = BareMessageV0.new(0x601);
    response.setMessageLength(4);

    const responseBytes = response.toBytes();

    socketCallback([responseBytes]);
}
