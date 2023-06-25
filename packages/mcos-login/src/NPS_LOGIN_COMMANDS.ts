import { TNPS_COMMAND_MAP } from "mcos/shared/interfaces";
import { NPS_LOGINCLIENT_COMMANDS } from "./NPS_LOGINCLIENT_COMMANDS.js";

/**
 * @export
 * @readonly
 * @type {TNPS_COMMAND_MAP[]}
 */

export const NPS_LOGIN_COMMANDS: TNPS_COMMAND_MAP[] = [
    ...NPS_LOGINCLIENT_COMMANDS,
];
