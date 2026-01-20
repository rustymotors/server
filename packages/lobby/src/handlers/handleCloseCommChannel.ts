import { BytableMessage } from "@rustymotors/binary";
import {
    getServerLogger,
    type ServerLogger,
} from "rusty-motors-shared";

export async function handleCloseCommChannel({
    connectionId,
    message,
    log = getServerLogger('lobby.handleCloseCommChannel'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: BytableMessage[];
}> {
    try {
        log.debug(`[${connectionId}] Handling NPS_CLOSE_COMM_CHANNEL`);
        log.debug(
            `[${connectionId}] Received command: ${message.header.id}`,
        );

        // l
        const incomingRequest = new BytableMessage();
        incomingRequest.setSerializeOrder([{ name: 'commId', field: 'Dword' }]);
        incomingRequest.deserialize(message.serialize());

        const requestedCommId =
            incomingRequest.getFieldValueByName('commId') ?? -1;

        log.debug(
            `[${connectionId}] Requested we close channel ${(requestedCommId as Buffer).readInt32BE()}`,
        );

        // TODO: Actually have servers

        // ll
        const outgoingGameMessage = new BytableMessage();
        outgoingGameMessage.setSerializeOrder([
            { name: 'commId', field: 'Dword' },
            { name: 'port', field: 'Dword' },
        ]);

        outgoingGameMessage.header.setId(0x209);
        outgoingGameMessage.setVersion(0);
        outgoingGameMessage.setFieldValueByName('commId', requestedCommId);
        outgoingGameMessage.setFieldValueByName('port', 7003);

        log.debug(
            `[${connectionId}] Sending response[string]: ${outgoingGameMessage.toString()}`,
        );
        // Build the packet
        const packetResult = new BytableMessage();
        packetResult.setSerializeOrder([{ name: 'data', field: 'Buffer' }]);
        packetResult.setVersion(0);
        packetResult.deserialize(outgoingGameMessage.serialize());

        return {
            connectionId,
            messages: [packetResult],
        };
    } catch (error) {
        const err = Error(
            `[${connectionId}] Error handling NPS_CLOSE_COMM_CHANNEL: ${String(error)}`,
        );
        err.cause = error;
        throw err;
    }
}