import type { NpsCommandMap } from "mcos-types";
import { NPS_LOGINCLIENT_COMMANDS } from "./NPS_LOGINCLIENT_COMMANDS.js";

/**
 * @export
 * @readonly
 * @type {NpsCommandMap[]}
 */

export const NPS_LOGIN_COMMANDS: NpsCommandMap[] = [
    ...NPS_LOGINCLIENT_COMMANDS,
];
