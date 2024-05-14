import { GameMessage } from "../../messageStructs/GameMessage.js";
import type { GameSocketCallback } from "../../gameMessageProcessors/index.js";

export function sendNPSAck(socketCallback: GameSocketCallback) {
    const response = new GameMessage(0);
    response.header.setId(519);

    const responseBytes = response.serialize();

    socketCallback([responseBytes]);
}
