import { ISerializable, IMessageHeader, IMessage } from "../types.js";
import { GameMessage } from "../messageStructs/GameMessage.js";
import { getDWord, getAsHex } from "../utils/pureGet.js";
import { SocketCallback } from "../messageProcessors/index.js";
import { getGameProfilesForCustomerId } from "../services/profile.js";
import { NPSList } from "../messageStructs/NPSList.js";
import { ProfileList } from "../messageStructs/ProfileList.js";

export function processGetProfileInfo(
    connectionId: string,
    message: GameMessage,
    socketCallback: SocketCallback,
): void {
    const customerId = getDWord(message.serialize(), 0, false);

    console.log(`GetProfileInfo: ${customerId}`);

    // Look up the profiles for the customer ID
    const profiles = getGameProfilesForCustomerId(customerId);

    // Create a new NPSList of profiles
    const list = new ProfileList();

    const outMessage = new GameMessage(0);

    // Add each profile to the list
    if (profiles) {
        outMessage.header.setId(0x607);
        for (const profile of profiles) {
            // Log the profile
            console.log(`GetProfileInfo: ${profile.toString()}`); // TODO: Remove this line

            list.addProfile(profile);
        }
    } else {
        outMessage.header.setId(0x602);
    }

    // Send the list back to the client
    try {
        // Log the message data
        console.log(`GetProfileInfo: ${getAsHex(list.serialize())}`);

        outMessage.setData(list);

        // Log the message
        console.log(`GetProfileInfo: ${outMessage.toString()}`);

        console.log("===========================================");

        socketCallback([outMessage.serialize()]);
    } catch (error) {
        console.log(error);
    }
}
