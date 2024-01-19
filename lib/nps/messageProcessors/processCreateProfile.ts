import { get } from "http";
import { BareMessage, BareMessageV0 } from "../BareMessage.js";
import { SocketCallback } from "./index.js";
import { getLenString, getNBytes } from "../pureGet.js";

export function processCreateProfile(
    connectionId: string,
    message: BareMessage,
    socketCallback: SocketCallback,
): void {

    const requestBytes = message.toBytes();

    const request = BareMessageV0.fromBytes(requestBytes, requestBytes.length);

    console.log("Create profile request: ", request.toHex());
}
