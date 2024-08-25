import {
	GameMessage,
	MiniRiffInfo,
	MiniRiffList,
	getAsHex,
} from "rusty-motors-nps";
import { getServerLogger } from "rusty-motors-shared";

const log = getServerLogger({});

// Command id: 0x30c
export async function getLobMiniRiffList(
	commandId: number,
	data: Buffer,
): Promise<Buffer> {
	log.debug("getLobMiniRiffList called");
	log.info(`Processing getLobMiniRiffList command: ${getAsHex(data)}`);

	const riffList = new MiniRiffList();

	riffList.addRiff(new MiniRiffInfo("CTRL", 0, 1));
	riffList.addRiff(new MiniRiffInfo("MC141", 141, 0));
	riffList.addRiff(new MiniRiffInfo("MCCHAT", 191, 0));

	log.info(`getLobMiniRiffList: ${riffList.toString()}`);

	const responseMessage = new GameMessage(0);
	responseMessage.header.setId(0x404);
	responseMessage.setData(riffList);

	log.info("Dumping responseMessage: ");

	log.info(
		`responseMessage: ${
			responseMessage.serialize().length
		} bytes - ${getAsHex(responseMessage.serialize())}`,
	);

	return responseMessage.serialize();
}
