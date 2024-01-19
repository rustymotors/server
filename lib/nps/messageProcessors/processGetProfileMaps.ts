import { BareMessage } from "../messageStructs/BareMessage.js";
import { BareMessageV0 } from "../messageStructs/BareMessageV0.js";
import { getDWord, getAsHex } from "../utils/pureGet.js";
import { SocketCallback } from "../messageProcessors/index.js";
import { getGameProfilesForCustomerId } from "../services/profile.js";
import { NPSList } from "../messageStructs/NPSList.js";
import { ProfileList } from "../messageStructs/ProfileList.js";

export function processGetProfileMaps(
    connectionId: string,
    message: BareMessage,
    socketCallback: SocketCallback,
): void {
    const customerId = getDWord(message.getData(), 0, false);

    console.log(`GetProfileMaps: ${customerId}`);

    // Look up the profiles for the customer ID
    const profiles = getGameProfilesForCustomerId(customerId);

    // Create a new NPSList of profiles
    const list = new ProfileList();

    // Add each profile to the list

    // Send the list back to the client
    const outMessage = BareMessage.new(0x607);
    outMessage.setData(list.toBytes());

    // Log the message
    console.log(`GetProfileMaps: ${outMessage.toString()}`);

    socketCallback([outMessage.toBytes()]);
}
