import { BareMessage } from "../BareMessage.js";
import { getDWord, getAsHex } from "../pureGet.js";
import { SocketCallback } from "../messageProcessors/index.js";
import { getGameProfilesForCustomerId } from "../gameProfiles.js";
import { NPSList } from "../NPSList.js";

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
    const list = new NPSList();
}
