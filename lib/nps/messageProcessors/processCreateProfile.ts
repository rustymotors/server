import { get } from "http";
import { BareMessage } from "../messageStructs/BareMessage.js";
import { BareMessageV0 } from "../messageStructs/BareMessageV0.js";
import { SocketCallback } from "./index.js";
import { getLenString, getNBytes } from "../utils/pureGet.js";

export function processCreateProfile(
    connectionId: string,
    message: BareMessage,
    socketCallback: SocketCallback,
): void {
    const requestBytes = message.toBytes();

    const request = BareMessageV0.fromBytes(requestBytes, requestBytes.length);

    console.log("Create profile request: ", request.toHex());
}
