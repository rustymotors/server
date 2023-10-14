import { getServerLogger } from "../../shared/log.js";
import {
    LegacyMessage,
    NPSMessage,
    SerializedBuffer,
} from "../../shared/messageFactory.js";
import { BuddyInfo, BuddyListCount } from "./BuddyInfoMessage.js";
import { buddies } from "./internal.js";

export async function _getFirstBuddy({
    connectionId,
    message,
    log = getServerLogger({
        module: "PersonaServer",
    }),
}: {
    connectionId: string;
    message: LegacyMessage;
    log?: import("pino").Logger;
}): Promise<{
    connectionId: string;
    messages: SerializedBuffer[];
}> {
    // This message is a versioned nps message
    const incomingMessage = new NPSMessage();
    incomingMessage._doDeserialize(message._doSerialize());

    log.debug(
        `in _getFirstBuddy, incomingMessage: ${incomingMessage
            .serialize()
            .toString("hex")}`,
    );

    // extract the personaId
    const personaId = incomingMessage.data.readUInt32BE(0);

    // TODO: Here we need to look up the buddies for the personaId
    const buddyCountMessage = new BuddyListCount();

    for (const buddy of buddies) {
        const buddyInfo = BuddyInfo.fromRecord(buddy);
        buddyCountMessage.addBuddy(buddyInfo);
    }

    const outboundMessage = new SerializedBuffer();
    outboundMessage.setBuffer(buddyCountMessage.serialize());

    log.debug(
        `in _getFirstBuddy, outboundMessage: ${outboundMessage.data.toString(
            "hex",
        )}`,
    );

    return {
        connectionId,
        messages: [outboundMessage],
    };
}
