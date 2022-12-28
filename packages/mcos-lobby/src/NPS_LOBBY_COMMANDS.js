import { NPS_LOBBYCLIENT_COMMANDS } from "./NPS_LOBBYCLIENT_COMMANDS.js";
import { NPS_LOBBYSERVER_COMMANDS } from "./NPS_LOBBYSERVER_COMMANDS.js";

/**
 * @global
 * @typedef {object} NpsCommandMap
 * @property {string} name
 * @property {number} value
 * @property {"Lobby" | "Login"} module
 */

/**
 * @export
 * @readonly
 * @type {NpsCommandMap[]}
 */
export const NPS_LOBBY_COMMANDS = [
    ...NPS_LOBBYCLIENT_COMMANDS,
    ...NPS_LOBBYSERVER_COMMANDS,
];
