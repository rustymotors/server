import { _npsRequestGameConnectServer } from 'rusty-motors-lobby';
import type { RoomHandlerArgs, RoomHandlerResult } from './registry.js';

export async function handleUserLogin(args: RoomHandlerArgs): Promise<RoomHandlerResult> {
    return _npsRequestGameConnectServer(args);
}
