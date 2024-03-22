import { GameMessage } from "../messageStructs/GameMessage.js";
import { getDWord, getAsHex } from "../utils/pureGet.js";
import type { SocketCallback } from "../messageProcessors/index.js";
import { getGameProfilesForCustomerId } from "../services/profile.js";
import { ProfileList } from "../messageStructs/ProfileList.js";

import { getServerLogger } from "@rustymotors/shared";

const log = getServerLogger();

export async function processGetProfileInfo(
    connectionId: string,
    message: GameMessage,
    socketCallback: SocketCallback,
): Promise<void> {
    const customerId = getDWord(message.serialize(), 0, false);

    log.info(`GetProfileInfo: ${customerId}`);

    // Look up the profiles for the customer ID
    const profiles = await getGameProfilesForCustomerId(customerId);

    // Create a new NPSList of profiles
    const list = new ProfileList();

    const outMessage = new GameMessage(0);

    // Add each profile to the list
    if (profiles) {
        outMessage.header.setId(0x607);
        for (const profile of profiles) {
            // Log the profile
            log.info(`GetProfileInfo: ${profile.toString()}`); // TODO: Remove this line

            list.addProfile(profile);
        }
    } else {
        outMessage.header.setId(0x602);
    }

    // Send the list back to the client
    try {
        // Log the message data
        log.info(`GetProfileInfo: ${getAsHex(list.serialize())}`);

        outMessage.setData(list);

        // Log the message
        log.info(`GetProfileInfo: ${outMessage.toString()}`);

        log.info("===========================================");

        socketCallback([outMessage.serialize()]);
    } catch (error) {
        log.error(`Error sending profile info: ${error}`);
        throw new Error("Error sending profile info");
    }
}
