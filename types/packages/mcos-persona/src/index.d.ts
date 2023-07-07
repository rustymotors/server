import { TNPSMessage, TServerLogger, TServiceResponse, TServiceRouterArgs } from "mcos/shared/interfaces";
/**
 * Selects a game persona and marks it as in use
 * @param {NPSMessage} requestPacket
 * @param {TServerLogger} log
 * @returns {Promise<NPSMessage>}
 */
export declare function handleSelectGamePersona(requestPacket: TNPSMessage, log: TServerLogger): Promise<TNPSMessage>;
/**
 * Entry and exit point for the persona service
 *
 */
export declare function receivePersonaData(args: TServiceRouterArgs): Promise<TServiceResponse>;
