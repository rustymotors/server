import { get } from "http";
import { BareMessage } from "../messageStructs/BareMessage.js";
import { BareMessageV0 } from "../messageStructs/BareMessageV0.js";
import { SocketCallback } from "./index.js";
import { getLenString, getNBytes } from "../utils/pureGet.js";
import { CreateProfileMessage } from "../messageStructs/CreateProfileMessage.js";


export function processCreateProfile(
    connectionId: string,
    message: BareMessage,
    socketCallback: SocketCallback,
): void {
    const requestBytes = message.toBytes();
    
    const request = message;

    // Log the request
    console.log(`Bare message request: ${request.toHex()}`);

    const createProfileMessage = CreateProfileMessage.fromBytes(
        request.getData(),
        request.getSize(),
    );

    // Log the request
    console.log(`Create profile request: ${createProfileMessage.toString()}`);
}
