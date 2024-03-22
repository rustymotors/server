import { LegacyMessage, SerializedBuffer } from "@rustymotors/shared";
export declare function _getFirstBuddy({
    connectionId,
    message,
}: {
    connectionId: string;
    message: LegacyMessage;
}): Promise<{
    connectionId: string;
    messages: SerializedBuffer[];
}>;
interface BuddyInfoRecord {
    buddyId: number;
    buddyName: string;
    gameName: string;
    isBuddy: boolean;
    isOnline: boolean;
    dnd: boolean;
    dnb: boolean;
    noEntry: boolean;
    muteWhispers: boolean;
    muteChat: boolean;
}
export declare const buddies: BuddyInfoRecord[];
export {};
