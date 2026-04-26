import { BytableMessage } from "@rustymotors/binary";
import {
    getServerLogger,
    type ServerLogger,
    type UserInfo,
    databaseProvider,
} from "rusty-motors-shared";

export async function handleGetUserList({
    connectionId,
    message,
    log = getServerLogger('lobby.handleGetUserList'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: BytableMessage[];
}> {
    try {
        log.debug(`[${connectionId}] Handling NPS_GET_USER_LIST`);
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
            `[${connectionId}] Requested we send the user list for channel ${(requestedCommId as Buffer).readInt32BE()}`,
        );

        // TODO: Actually have servers

        // ll
        const outgoingGameMessage = new BytableMessage();
        outgoingGameMessage.setSerializeOrder([
            { name: 'commId', field: 'Dword' },
            { name: 'userCount', field: 'Dword' },
            { name: 'usersList', field: 'Buffer' },
        ]);

        outgoingGameMessage.header.setId(0x211);
        outgoingGameMessage.setVersion(0);
        outgoingGameMessage.setFieldValueByName('commId', requestedCommId);

        const userList: UserInfo[] = [];

        const user1 = await databaseProvider.getSessionStore().getUser(21);

        if (typeof user1 !== 'undefined') {
            log.debug(`Fetched userData: ${JSON.stringify(user1.userData)}`);
            userList.push(user1);
        }

        outgoingGameMessage.setFieldValueByName('userCount', userList.length);

        let users = Buffer.alloc(0);

        for (const user of userList) {
            users = Buffer.concat([users, user.serialize()]);
        }

        outgoingGameMessage.setFieldValueByName('usersList', users);

        log.debug(
            `[${connectionId}] Sending response[string]: ${outgoingGameMessage.toString()}`,
        );
        // Build the packet
        const packetResult = new BytableMessage();
        packetResult.setSerializeOrder([{ name: 'data', field: 'Buffer' }]);
        packetResult.setVersion(0);
        packetResult.deserialize(outgoingGameMessage.serialize());

        let messages: BytableMessage[] = [];
        
        if (outgoingGameMessage.getFieldValueByName('commId') === '2883705') {
        
            messages = [];
        }

        return {
            connectionId,
            messages,
        };
    } catch (error) {
        const err = Error(
            `[${connectionId}] Error handling NPS_GET_USER_LIST: ${String(error)}`,
        );
        err.cause = error;
        throw err;
    }
}