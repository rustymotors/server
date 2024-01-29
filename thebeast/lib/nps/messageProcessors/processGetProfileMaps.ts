import { ISerializable, IMessageHeader, IMessage } from "../types.js";
import { GameMessage } from "../messageStructs/GameMessage.js";
import { getDWord, getAsHex } from "../utils/pureGet.js";
import { SocketCallback } from "../messageProcessors/index.js";
import { getGameProfilesForCustomerId } from "../services/profile.js";
import { NPSList } from "../messageStructs/NPSList.js";
import { ProfileList } from "../messageStructs/ProfileList.js";

export async function processGetProfileMaps(
    connectionId: string,
    message: GameMessage,
    socketCallback: SocketCallback,
): Promise<void> {
    // This message is a version 257, but it's version is set to 0
    // This is a bug in the client, so we need to generate a new message
    // with the correct version
    const requestMessage = GameMessage.fromGameMessage(257, message);

    console.log(`GetProfileMaps (257): ${requestMessage.toString()}`);

    const customerId = getDWord(requestMessage.getDataAsBuffer(), 0, false);

    console.log(`GetProfileMaps: ${customerId}`);

    // Look up the profiles for the customer ID
    const profiles = await getGameProfilesForCustomerId(customerId);

    // Create a new NPSList of profiles
    const list = new ProfileList();

    // Add each profile to the list
    if (profiles) {
        for (const profile of profiles) {
            // Log the profile
            console.log(`GetProfileMaps: ${profile.toString()}`);

            list.addProfile(profile);
        }
    }

    // Send the list back to the client
    try {
        const outMessage = new GameMessage(257);
        outMessage.header.setId(0x607);

        // Log the message data
        console.log(`GetProfileMaps: ${getAsHex(outMessage.serialize())}`);

        outMessage.setData(list);

        // Log the message
        console.log(`GetProfileMaps: ${outMessage.toString()}`);

        console.log("===========================================");

        socketCallback([outMessage.serialize()]);
    } catch (error) {
        console.log(error);
    }
}
