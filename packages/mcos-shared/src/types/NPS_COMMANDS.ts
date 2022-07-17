import { NPS_LOBBY_COMMANDS } from './NPS_LOBBY_COMMANDS.js';
import { NPS_LOGINCLIENT_COMMANDS } from './NPS_LOGINCLIENT_COMMANDS.js';
import { NpsCommandMap } from './types.js';

/**
 * @export
 * @readonly
 * @type {NpsCommandMap[]}
 */

export const NPS_COMMANDS: NpsCommandMap[] = [
  ...NPS_LOBBY_COMMANDS,
  ...NPS_LOGINCLIENT_COMMANDS,
  { name: 'NPS_CRYPTO_DES_CBC', value: 0x1101, module: 'Lobby' }
];
