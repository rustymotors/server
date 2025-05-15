import {
    GameMessage,
    MiniUserInfo,
    MiniUserList,
    getAsHex,
} from 'rusty-motors-nps';
import { getServerLogger } from 'rusty-motors-logger';

const defaultLogger = getServerLogger('nps.getLobMiniUserList');

/**
 * Generates a serialized response containing a mini user list with a single user for the getLobMiniUserList command.
 *
 * @param _commandId - The command identifier (unused).
 * @param data - The input buffer associated with the command.
 * @returns A Promise that resolves to a Buffer containing the serialized response message.
 */
export async function getLobMiniUserList(
    _commandId: number,
    data: Buffer,
): Promise<Buffer> {
    defaultLogger.debug('getLobMiniUserList called');
    defaultLogger.info(
        `Processing getLobMiniUserList command: ${getAsHex(data)}`,
    );

    const miniUserList = new MiniUserList(0);

    miniUserList.addChannelUser(new MiniUserInfo(1000, 'Molly'));

    const responseMessage = new GameMessage(0);
    responseMessage.header.setId(0x229);
    responseMessage.setData(miniUserList);

    return Promise.resolve(responseMessage.serialize());
}
