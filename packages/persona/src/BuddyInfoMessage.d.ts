/// <reference types="node" />
import { NetworkMessage, RawMessage } from "@rustymotors/shared";
/**
 * BuddyInfoMessage
 *
 * This is a response to a NPS_GET_BUDDY_LIST message.
 * It is actually two messages, the first is a NPS_BUDDY_LIST_COUNT
 * message, which contains the number of buddies in the list and has
 * a response code of NPS_BUDDY_LIST_COUNT - 1556 (0x614).
 *
 * The second message is a NPS_BUDDY_LIST message, which contains the
 * buddy list itself. It has a response code of 1544 (0x608).
 */
export declare class BuddyInfoMessage extends RawMessage {
    _buddyCount: number;
    _buddyList: BuddyList[];
    _longOne: number;
    _longTwo: number;
    constructor();
    get length(): number;
    serialize(): Buffer;
    add(buddy: BuddyList): void;
}
export declare class BuddyCount extends NetworkMessage {
    _buddyCount: number;
    constructor();
    get length(): number;
    serialize(): Buffer;
    set buddyCount(count: number);
}
export declare class BuddyList extends RawMessage {
    buddyName: string;
    gameName: string;
    isBuddy: boolean;
    isOnline: boolean;
    dnd: boolean;
    dnb: boolean;
    noEntry: boolean;
    muteWhispers: boolean;
    muteChat: boolean;
    constructor();
    get length(): number;
    serialize(): Buffer;
    toString(): string;
}
