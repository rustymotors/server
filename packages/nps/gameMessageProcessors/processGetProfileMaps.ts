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

/**
 * Processes a request to retrieve profile maps for a customer and sends the profile list response to the client.
 *
 * Extracts the customer ID from the incoming game message, retrieves associated game profiles, constructs a profile list, and responds to the client with the profile data.
 *
 * @param message - The incoming game message containing the customer ID.
 * @param socketCallback - Callback function to send the response message to the client.
 *
 * @throws {Error} If an error occurs while sending the profile information to the client.
 */
export async function processGetProfileMaps(
    _connectionId: string,
    _userStatus: UserStatus,
    message: GameMessage,
    socketCallback: GameSocketCallback,
): Promise<void> {
    const defaultLogger = getServerLogger('nps.processGetProfileMaps');
    // This message is a version 257, but it's version is set to 0
    // This is a bug in the client, so we need to generate a new message
    // with the correct version
    const requestMessage = GameMessage.fromGameMessage(257, message);

    defaultLogger.info(`GetProfileMaps (257): ${requestMessage.toString()}`);

    const customerId = getDWord(requestMessage.getDataAsBuffer(), 0, false);

    defaultLogger.info(`GetProfileMaps: ${customerId}`);

    // Look up the profiles for the customer ID
    const profiles = getGameProfilesForCustomerId(customerId);

    // Create a new NPSList of profiles
    const list = new ProfileList();

    // Add each profile to the list
    if (profiles) {
        for (const profile of profiles) {
            // Log the profile
            defaultLogger.info(`GetProfileMaps: ${profile.toString()}`);

            list.addProfile(profile);
        }
    }

    // Send the list back to the client
    try {
        const outMessage = new GameMessage(257);
        outMessage.header.setId(0x607);

        // Log the message data
        defaultLogger.info(
            `GetProfileMaps: ${getAsHex(outMessage.serialize())}`,
        );

        outMessage.setData(list);

        // Log the message
        defaultLogger.info(`GetProfileMaps: ${outMessage.toString()}`);

        defaultLogger.info('===========================================');

        socketCallback([outMessage.serialize()]);
        return Promise.resolve();
    } catch (error) {
        defaultLogger.error(`Error sending profile info: ${error as string}`);
        throw new Error('Error sending profile info');
    }
}
