import { GameMessage, Logger, ServiceArgs, ServiceResponse } from "../../interfaces/index.js";
/**
 * Selects a game persona and marks it as in use
 * @param {NPSMessage} requestPacket
 * @param {TServerLogger} log
 * @returns {Promise<NPSMessage>}
 */
export declare function handleSelectGamePersona(requestPacket: GameMessage, log: Logger): Promise<GameMessage>;
/**
 * Entry and exit point for the persona service
 *
 */
export declare function receivePersonaData(args: ServiceArgs): Promise<ServiceResponse>;
//# sourceMappingURL=index.d.ts.map