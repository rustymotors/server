import {
    GameMessage,
    ProfileList,
    getAsHex,
    getDWord,
    getGameProfilesForCustomerId,
} from 'rusty-motors-nps';
import type { GameSocketCallback } from './index.js';

import type { UserStatus } from 'rusty-motors-nps';
import { getServerLogger } from 'rusty-motors-logger';

const defaultLogger = getServerLogger('nps.processGetProfileInfo');

/**
 * Processes a request to retrieve game profiles for a customer and sends the profile list to the client.
 *
 * Extracts the customer ID from the incoming {@link message}, retrieves associated game profiles, constructs a response message with the appropriate header, and sends the serialized profile list using the provided {@link socketCallback}.
 *
 * @param message - The incoming game message containing the customer ID.
 * @param socketCallback - Callback function to send the response message to the client.
 *
 * @throws {Error} If an error occurs while sending the profile information to the client.
 */
export async function processGetProfileInfo(
    _connectionId: string,
    _userStatus: UserStatus,
    message: GameMessage,
    socketCallback: GameSocketCallback,
): Promise<void> {
    const customerId = getDWord(message.serialize(), 0, false);

    defaultLogger.info(`GetProfileInfo: ${customerId}`);

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
            defaultLogger.info(`GetProfileInfo: ${profile.toString()}`); // TODO: Remove this line

            list.addProfile(profile);
        }
    } else {
        outMessage.header.setId(0x602);
    }

    // Send the list back to the client
    try {
        // Log the message data
        defaultLogger.info(`GetProfileInfo: ${getAsHex(list.serialize())}`);

        outMessage.setData(list);

        // Log the message
        defaultLogger.info(`GetProfileInfo: ${outMessage.toString()}`);

        defaultLogger.info('===========================================');

        socketCallback([outMessage.serialize()]);
        return Promise.resolve();
    } catch (error) {
        defaultLogger.error(`Error sending profile info: ${error as string}`);
        throw new Error('Error sending profile info');
    }
}
