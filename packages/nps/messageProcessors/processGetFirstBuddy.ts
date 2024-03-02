import { ISerializable, IMessageHeader, IMessage } from "../types.js";
import {
    GameMessage,
    SerializableData,
} from "../messageStructs/GameMessage.js";
import { getDWord, getAsHex } from "../utils/pureGet.js";
import { SocketCallback } from "./index.js";
import { getGameProfilesForCustomerId } from "../services/profile.js";
import { NPSList } from "../messageStructs/NPSList.js";
import { ProfileList } from "../messageStructs/ProfileList.js";
import { log } from "../../shared/log.js";

export async function processFirstBuddy(
    connectionId: string,
    message: GameMessage,
    socketCallback: SocketCallback,
): Promise<void> {
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
}
