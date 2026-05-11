import { NPS_MESSAGE_IDS } from 'rusty-motors-shared';
import type { BytableMessage } from '@rustymotors/binary';
import type { ServerLogger } from 'rusty-motors-shared';
import { handleEncryptedCommand } from './handleEncryptedCommand.js';
import { handleOpenCommChannel } from './handleOpenCommChannel.js';
import { handleTrackingPing } from './handleTrackingPing.js';

export interface RoomHandlerArgs {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}

export interface RoomHandlerResult {
    connectionId: string;
    messages: { serialize(): Buffer }[];
}

type RoomHandler = (args: RoomHandlerArgs) => Promise<RoomHandlerResult>;

interface RoomHandlerEntry {
    opCode: number;
    name: string;
    handler: RoomHandler;
}

class RoomsRegistry {
    private readonly handlers = new Map<number, RoomHandlerEntry>();

    register(entry: RoomHandlerEntry): void {
        this.handlers.set(entry.opCode, entry);
    }

    getHandler(opCode: number): RoomHandlerEntry | undefined {
        return this.handlers.get(opCode);
    }
}

export function createRoomHandlerRegistry(): RoomsRegistry {
    const registry = new RoomsRegistry();

    registry.register({
        opCode: NPS_MESSAGE_IDS.OPEN_COMM_CHANNEL,
        name: 'NPS_OPEN_COMM_CHANNEL',
        handler: handleOpenCommChannel,
    });

    registry.register({
        opCode: NPS_MESSAGE_IDS.TRACKING_PING,
        name: 'NPS_TRACKING_PING',
        handler: handleTrackingPing,
    });

    registry.register({
        opCode: NPS_MESSAGE_IDS.ENCRYPTED_COMMAND,
        name: 'NPS_ENCRYPTED_COMMAND',
        handler: handleEncryptedCommand,
    });

    return registry;
}

let registryInstance: RoomsRegistry | null = null;

export function getRoomHandlerRegistry(): RoomsRegistry {
    if (!registryInstance) {
        registryInstance = createRoomHandlerRegistry();
    }
    return registryInstance;
}

export function clearRoomHandlerRegistry(): void {
    registryInstance = null;
}
