import { BareMessage } from "../messageStructs/BareMessage.js";
import { BareMessageV0 } from "../messageStructs/BareMessageV0.js";
import { getDWord, getAsHex } from "../utils/pureGet.js";
import { SocketCallback } from "../messageProcessors/index.js";
import { getGameProfilesForCustomerId } from "../services/profile.js";
import { NPSList } from "../messageStructs/NPSList.js";
import { ProfileList } from "../messageStructs/ProfileList.js";

export function processGetProfileInfo(
    connectionId: string,
    message: BareMessage,
    socketCallback: SocketCallback,
): void {
    const customerId = getDWord(message.getData(), 0, false);

    console.log(`GetProfileInfo: ${customerId}`);

    // Look up the profiles for the customer ID
    const profiles = getGameProfilesForCustomerId(customerId);

    // Create a new NPSList of profiles
    const list = new ProfileList();
    
    const outMessage = BareMessage.new(0);

    // Add each profile to the list
    if (profiles) {
        outMessage.setMessageId(0x607); // Found
        for (const profile of profiles) {
            // Log the profile
            console.log(profile.toString());

            list.addProfile(profile);
        }
    }
    else {
        outMessage.setMessageId(0x602); // Not found
    }

    // Send the list back to the client
try {
    
        // Set the message data
        const messageData = list.toBytes();
        // Log the message data
        console.log(`GetProfileInfo: ${getAsHex(messageData)}`);
    
        outMessage.setData(messageData);
    
        // Log the message
        console.log(`GetProfileInfo: ${outMessage.toString()}`);
    
        console.log('===========================================');
    
        socketCallback([outMessage.toBytes()]);
} catch (error) {
    console.log(error);
}
}
