import {
    GameMessage,
    SerializableData,
} from "../messageStructs/GameMessage.js";
import { getDWord } from "../utils/pureGet.js";
import type { SocketCallback } from "./index.js";
import { getGameProfilesForCustomerId } from "../services/profile.js";
import { ProfileList } from "../messageStructs/ProfileList.js";

import { getServerLogger } from "../../shared";
import type { UserStatus } from "../messageStructs/UserStatus.js";

const log = getServerLogger();

export async function processFirstBuddy(
    connectionId: string,
    userStatus: UserStatus,
    message: GameMessage,
    socketCallback: SocketCallback,
): Promise<void> {
    log.setName("nps:processFirstBuddy");
    const profileId = getDWord(message.getDataAsBuffer(), 0, false);

    log.info(`GetFirstBuddy profile: ${profileId}`);

    // Look up the profiles for the customer ID
    const profiles = getGameProfilesForCustomerId(profileId);

    // Create a new NPSList of profiles
    const list = new ProfileList();

    const outMessage = new GameMessage(257);
    outMessage.header.setId(0x614);
    outMessage.setData(new SerializableData(4));

    // Log the message
    log.info(`GetFirstBuddy: ${outMessage.toString()}`);

    log.info("===========================================");

    socketCallback([outMessage.serialize()]);
    log.resetName();
    return Promise.resolve();
}
