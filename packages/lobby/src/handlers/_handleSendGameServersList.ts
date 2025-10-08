import { BytableMessage } from "@rustymotors/binary";
import {
    getServerLogger,
    ServerLogger,
    GameServerListMessage,
    GameServerInfo
} from "rusty-motors-shared";
import { chatChannelIds } from "./channels.js";

export async function handleSendGameServersList({
    connectionId,
    message,
    log = getServerLogger("lobby.handleSendGameServersList"),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    message: BytableMessage;
}> {
    try {
        log.debug(`[${connectionId}] Handling NPS_SEND_GAME_SERVERS_LIST`);
        log.debug(
            `[${connectionId}] Received command: ${message.header.messageId}`,
        );

        // l
        const incomingRequest = new BytableMessage();
        incomingRequest.setSerializeOrder([{ name: "commId", field: "Dword" }]);
        incomingRequest.deserialize(message.serialize());

        // TODO: Actually have servers
        // ppp
        const outgoingGameMessage = new GameServerListMessage();
        
        outgoingGameMessage.id = 0x402;

        const gameServer1 = new GameServerInfo("RACE", "71.186.155.248")
        
        outgoingGameMessage.add(gameServer1)

                log.debug(
            `[${connectionId}] Sending gameserver response[serialize]: ${JSON.stringify(gameServer1)}`,
        );

        
        // Build the packet
        const packetResult = new BytableMessage();
        packetResult.setSerializeOrder([
            { name: "data", field: "Buffer" },
        ]);
        packetResult.setVersion(0);
        packetResult.deserialize(outgoingGameMessage.serialize());

        log.debug(
            `[${connectionId}] Sending gameserver response[serialize2]: ${packetResult.serialize().toString("hex")}`,
        );

        return {
            connectionId,
            message: packetResult,
        };
    } catch (error) {
        const err = Error(
            `[${connectionId}] Error handling NPS_SEND_GAME_SERVERS_LIST: ${String(error)}`,
        );
        err.cause = error;
        throw err;
    }
}