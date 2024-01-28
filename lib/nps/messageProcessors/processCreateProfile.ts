import { ISerializable, IMessageHeader, IMessage } from "../types.js";
import { GameMessage } from "../messageStructs/GameMessage.js";
import { SocketCallback } from "./index.js";
import { getLenString, getNBytes } from "../utils/pureGet.js";
import { GameProfile } from "../messageStructs/GameProfile.js";


export function processCreateProfile(
    connectionId: string,
    message: GameMessage,
    socketCallback: SocketCallback,
): void {

    // Log the request
    console.log(`ProcessCreateProfile request: ${message.toString()}`);

    const createProfileMessage = GameProfile.fromBytes(
        message.getDataAsBuffer(),
        message.getData().getByteSize(),
    );

    // Log the request
    console.log(`ProcessCreateProfile request: ${createProfileMessage.toString()}`);

    // TODO: Create the profile

    // TODO: Send the response
    const response = new GameMessage(257);
    response.header.setId(0x601);
    
    response.setData(message.getData());

    // Log the response
    console.log(`ProcessCreateProfile response: ${response.toString()}`);

    socketCallback([response.serialize()]);
}
