import {
  GameMessage,
  ProfileList,
  getAsHex,
  getDWord,
  getGameProfilesForCustomerId,
} from "nps";
import type { GameSocketCallback } from "./index.js";

import type { UserStatus } from "nps";
import { getServerLogger } from "shared";

const log = getServerLogger();

export async function processGetProfileMaps(
  connectionId: string,
  userStatus: UserStatus,
  message: GameMessage,
  socketCallback: GameSocketCallback
): Promise<void> {
  log.setName("nps:processGetProfileMaps");
  // This message is a version 257, but it's version is set to 0
  // This is a bug in the client, so we need to generate a new message
  // with the correct version
  const requestMessage = GameMessage.fromGameMessage(257, message);

  log.info(`GetProfileMaps (257): ${requestMessage.toString()}`);

  const customerId = getDWord(requestMessage.getDataAsBuffer(), 0, false);

  log.info(`GetProfileMaps: ${customerId}`);

  // Look up the profiles for the customer ID
  const profiles = getGameProfilesForCustomerId(customerId);

  // Create a new NPSList of profiles
  const list = new ProfileList();

  // Add each profile to the list
  if (profiles) {
    for (const profile of profiles) {
      // Log the profile
      log.info(`GetProfileMaps: ${profile.toString()}`);

      list.addProfile(profile);
    }
  }

  // Send the list back to the client
  try {
    const outMessage = new GameMessage(257);
    outMessage.header.setId(0x607);

    // Log the message data
    log.info(`GetProfileMaps: ${getAsHex(outMessage.serialize())}`);

    outMessage.setData(list);

    // Log the message
    log.info(`GetProfileMaps: ${outMessage.toString()}`);

    log.info("===========================================");

    socketCallback([outMessage.serialize()]);
    log.resetName();
    return Promise.resolve();
  } catch (error) {
    log.error(`Error sending profile info: ${error as string}`);
    throw new Error("Error sending profile info");
  }
}
