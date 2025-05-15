import {
    GameMessage,
    MiniRiffInfo,
    MiniRiffList,
    getAsHex,
} from 'rusty-motors-nps';
import { getServerLogger } from 'rusty-motors-logger';

const defaultLogger = getServerLogger('nps.getLobMiniRiffList');

/**
 * Handles the 0x30c command by returning a serialized list of predefined MiniRiff entries.
 *
 * Constructs a {@link MiniRiffList} containing three fixed entries and returns it as a serialized {@link GameMessage} buffer with header ID 0x404.
 *
 * @param data - The incoming command data buffer.
 * @returns A buffer containing the serialized response message with the MiniRiff list.
 */
export async function getLobMiniRiffList(
    _commandId: number,
    data: Buffer,
): Promise<Buffer> {
    defaultLogger.debug('getLobMiniRiffList called');
    defaultLogger.info(
        `Processing getLobMiniRiffList command: ${getAsHex(data)}`,
    );

    const riffList = new MiniRiffList();

    riffList.addRiff(new MiniRiffInfo('CTRL', 0, 1));
    riffList.addRiff(new MiniRiffInfo('MC141', 141, 0));
    riffList.addRiff(new MiniRiffInfo('MCCHAT', 191, 0));

    defaultLogger.info(`getLobMiniRiffList: ${riffList.toString()}`);

    const responseMessage = new GameMessage(0);
    responseMessage.header.setId(0x404);
    responseMessage.setData(riffList);

    defaultLogger.info('Dumping responseMessage: ');

    defaultLogger.info(
        `responseMessage: ${
            responseMessage.serialize().length
        } bytes - ${getAsHex(responseMessage.serialize())}`,
    );

    return responseMessage.serialize();
}
