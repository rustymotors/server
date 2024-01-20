import { get } from "http";
import { BareMessage } from "../messageStructs/BareMessage.js";
import { BareMessageV0 } from "../messageStructs/BareMessageV0.js";
import { SocketCallback } from "./index.js";
import { getLenString, getNBytes } from "../utils/pureGet.js";
import { GameProfile } from "../messageStructs/GameProfile.js";


export function processCreateProfile(
    connectionId: string,
    message: BareMessage,
    socketCallback: SocketCallback,
): void {
    const requestBytes = message.toBytes();
    
    const request = message;

    // Log the request
    console.log(`Bare message request: ${request.toHex()}`);

    const createProfileMessage = GameProfile.fromBytes(
        request.getData(),
        request.getSize(),
    );

    // Log the request
    console.log(createProfileMessage.toString());

    // TODO: Create the profile

    // TODO: Send the response
    const response = BareMessage.new(0x601);
    response.setData(request.getData());

    // Log the response
    console.log(`Bare message response: ${response.toHex()}`);

    socketCallback([response.toBytes()]);
}
