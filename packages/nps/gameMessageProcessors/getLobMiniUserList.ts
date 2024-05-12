import { getServerLogger } from "rusty-motors-shared";
import { GameMessage } from "../messageStructs/GameMessage.js";
import { MiniUserInfo, MiniUserList } from "../messageStructs/MiniUserList.js";
import { getAsHex } from "../src/utils/pureGet.js";

const log = getServerLogger();

// Command id: 0x128
export async function getLobMiniUserList(
    commandId: number,
    data: Buffer,
): Promise<Buffer> {
    log.setName("nps:getLobMiniUserList");
    log.info(`Processing getLobMiniUserList command: ${getAsHex(data)}`);

    const miniUserList = new MiniUserList(0);

    miniUserList.addChannelUser(new MiniUserInfo(1000, "Molly"));

    const responseMessage = new GameMessage(0);
    responseMessage.header.setId(0x229);
    responseMessage.setData(miniUserList);

    return Promise.resolve(responseMessage.serialize());
}
