import { NPS_LOBBYCLIENT_COMMANDS } from "./NPS_LOBBYCLIENT_COMMANDS.js";
import { NPS_LOBBYSERVER_COMMANDS } from "./NPS_LOBBYSERVER_COMMANDS.js";

export type NpsCommandMap = {
    name: string;
    value: number;
    module: "Lobby" | "Login";
};

/**
 * @export
 * @readonly
 * @type {NpsCommandMap[]}
 */
export const NPS_LOBBY_COMMANDS: NpsCommandMap[] = [
    ...NPS_LOBBYCLIENT_COMMANDS,
    ...NPS_LOBBYSERVER_COMMANDS,
];
