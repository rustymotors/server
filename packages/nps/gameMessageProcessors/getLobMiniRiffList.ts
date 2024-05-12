import { getServerLogger } from "rusty-motors-shared";
import { GameMessage } from "../messageStructs/GameMessage.js";
import { MiniRiffInfo, MiniRiffList } from "../messageStructs/MiniRiffList.js";
import { getAsHex } from "../src/utils/pureGet.js";

const log = getServerLogger();

// Command id: 0x30c
export async function getLobMiniRiffList(
    commandId: number,
    data: Buffer,
): Promise<Buffer> {
    log.setName("nps:getLobMiniRiffList");
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
