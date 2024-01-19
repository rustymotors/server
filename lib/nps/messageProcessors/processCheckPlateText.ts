import { get } from "http";
import { BareMessage, BareMessageV0 } from "../BareMessage.js";
import { SocketCallback } from "./index.js";
import { getLenString, getNBytes } from "../pureGet.js";

export function processCheckPlateText(
    connectionId: string,
    message: BareMessage,
    socketCallback: SocketCallback,
): void {

    const requestBytes = message.toBytes();

    const request = BareMessageV0.fromBytes(requestBytes, requestBytes.length);

    const plateType = request.getData().readUInt32BE(0);

    const requestedPlateText = getLenString(request.getData(), 4, false);

    console.log(`Requested plate text: ${requestedPlateText} for plate type ${plateType}`);

    const response = BareMessageV0.new(0x207);
    response.setMessageLength(4);

    const responseBytes = response.toBytes();

    socketCallback([responseBytes]);
}
