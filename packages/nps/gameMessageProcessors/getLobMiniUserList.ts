import {
	GameMessage,
	MiniUserInfo,
	MiniUserList,
	getAsHex,
} from "rusty-motors-nps";
import { getServerLogger, type ServerLogger } from "rusty-motors-shared";

// Command id: 0x128
export async function getLobMiniUserList(
	_commandId: number,
	data: Buffer,
	logger: ServerLogger = getServerLogger("nps.getLobMiniUserList")
): Promise<Buffer> {
	logger.debug("getLobMiniUserList called");
	logger.info(`Processing getLobMiniUserList command: ${getAsHex(data)}`);

	const miniUserList = new MiniUserList(0);

	miniUserList.addChannelUser(new MiniUserInfo(1000, "Molly"));

	const responseMessage = new GameMessage(0);
	responseMessage.header.setId(0x229);
	responseMessage.setData(miniUserList);

	return Promise.resolve(responseMessage.serialize());
}
