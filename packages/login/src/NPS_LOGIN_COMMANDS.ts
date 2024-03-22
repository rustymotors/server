import type { GameMessageOpCode } from "../../interfaces/index.js";
import { NPS_LOGINCLIENT_COMMANDS } from "./NPS_LOGINCLIENT_COMMANDS.js";

/**
 * @export
 * @readonly
 * @type {TNPS_COMMAND_MAP[]}
 */

export const NPS_LOGIN_COMMANDS: GameMessageOpCode[] = [
    ...NPS_LOGINCLIENT_COMMANDS,
];
