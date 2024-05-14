import {
    GameMessage,
    ProfileList,
    getAsHex,
    getDWord,
    getGameProfilesForCustomerId,
} from 'rusty-motors-nps';
import type { GameSocketCallback } from './index.js';

import type { UserStatus } from 'rusty-motors-nps';
import { getServerLogger } from 'rusty-motors-shared';

const log = getServerLogger();

export async function processGetProfileInfo(
    connectionId: string,
    userStatus: UserStatus,
    message: GameMessage,
    socketCallback: GameSocketCallback
): Promise<void> {
    log.setName('nps:processGetProfileInfo');
    const customerId = getDWord(message.serialize(), 0, false);

    log.info(`GetProfileInfo: ${customerId}`);

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

        log.info('===========================================');

        socketCallback([outMessage.serialize()]);
        log.resetName();
        return Promise.resolve();
    } catch (error) {
        log.error(`Error sending profile info: ${error as string}`);
        throw new Error('Error sending profile info');
    }
}
