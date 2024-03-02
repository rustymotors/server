import { serializeStringRaw } from "@rustymotors/shared";
import { NetworkMessage } from "@rustymotors/shared";
import { RawMessage } from "@rustymotors/shared";

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

export class BuddyInfoMessage extends RawMessage {
    _buddyCount: number; // 2 bytes
    _buddyList: BuddyList[] = [];
    _longOne = 0x00000000; // 4 bytes
    _longTwo = 0x00000000; // 4 bytes
    constructor() {
        super(0x614);
        this._buddyCount = 0;
    }

    override get length(): number {
        return super.length + 2 + this._buddyCount * 115;
    }

    override serialize(): Buffer {
        const buffer = Buffer.alloc(this.length);
        let offset = 0;
        super.serialize().copy(buffer, offset);
        offset += super.length;
        buffer.writeUInt16BE(this._buddyCount, offset);
        offset += 2;
        for (const buddy of this._buddyList) {
            buddy.serialize().copy(buffer, offset);
            offset += buddy.length;
        }
        return buffer;
    }

    add(buddy: BuddyList): void {
        this._buddyList.push(buddy);
        this._buddyCount++;
    }
}

export class BuddyCount extends NetworkMessage {
    _buddyCount: number; // 2 bytes
    constructor() {
        super(0x614);
        this._buddyCount = 0;
    }

    override get length(): number {
        return super.length + 2;
    }

    override serialize(): Buffer {
        const buffer = Buffer.alloc(this.length);
        let offset = 0;
        buffer.writeUInt16BE(this.messageId, offset);
        offset += 2;
        buffer.writeUInt16BE(this.length, offset);
        offset += 2;
        buffer.writeUInt16BE(this.version, offset);
        offset += 2;
        buffer.writeUInt16BE(this.reserved, offset);
        offset += 2;
        buffer.writeUInt32BE(this.length, offset);
        offset += 4;
        buffer.writeUInt16BE(this._buddyCount, offset);
        return buffer;
    }

    set buddyCount(count: number) {
        this._buddyCount = count;
    }
}

export class BuddyList extends RawMessage {
    // These are BuddyMap fields
    // These are BuddyInfo fields
    buddyName = ""; // 33 bytes - 32 + null terminator
    gameName = ""; // 65 bytes - 64 + null terminator
    isBuddy = false; // 1 byte
    isOnline = false; // 1 byte
    dnd = false; // 1 byte
    dnb = false; // 1 byte
    noEntry = false; // 1 byte
    muteWhispers = false; // 1 byte
    muteChat = false; // 1 byte

    constructor() {
        super(0x608);
    }

    override get length(): number {
        return 115;
    }

    override serialize(): Buffer {
        const buffer = Buffer.alloc(this.length);
        let offset = 0;
        super.serialize().copy(buffer, offset);
        offset += super.length;
        buffer.writeUInt16BE(this.messageId, offset);
        offset += 2;
        offset = serializeStringRaw(this.buddyName, buffer, offset, 33);
        offset = serializeStringRaw(this.gameName, buffer, offset, 65);
        buffer.writeUInt8(this.isBuddy ? 1 : 0, offset);
        offset += 1;
        buffer.writeUInt8(this.isOnline ? 1 : 0, offset);
        offset += 1;
        buffer.writeUInt8(this.dnd ? 1 : 0, offset);
        offset += 1;
        buffer.writeUInt8(this.dnb ? 1 : 0, offset);
        offset += 1;
        buffer.writeUInt8(this.noEntry ? 1 : 0, offset);
        offset += 1;
        buffer.writeUInt8(this.muteWhispers ? 1 : 0, offset);
        offset += 1;
        buffer.writeUInt8(this.muteChat ? 1 : 0, offset);

        return buffer;
    }

    override toString(): string {
        return this.serialize().toString("hex");
    }
}
