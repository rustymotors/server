import {
    LegacyMessage,
    NPSMessage,
    SerializedBuffer,
    serializeStringRaw,
} from "../../shared/messageFactory.js";

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

export class BuddyInfoMessage extends SerializedBuffer {
    _buddyCount: number; // 2 bytes
    constructor() {
        super();
        this._buddyCount = 0;
    }

    override size(): number {
        return super.size();
    }

    override serialize(): Buffer {
        const buffer = Buffer.alloc(this.size());

        return buffer;
    }
}

export class BuddyListCount extends NPSMessage {
    _buddyCount: number; // 2 bytes
    _buddies: BuddyInfo[];
    constructor() {
        super();
        this._header.id = 0x614;
        this._buddyCount = 0;
        this._buddies = [];
    }

    override size(): number {
        return this._header._size + 2 + this._buddies.length * 115;
    }

    addBuddy(buddy: BuddyInfo) {
        this._buddies.push(buddy);
        this._buddyCount = this._buddies.length;
        this._header.length = this.size();
    }

    override serialize(): Buffer {
        const buffer = Buffer.alloc(this.size());
        let offset = 0;
        this._header._doSerialize().copy(buffer, offset);
        offset += this._header._size;
        buffer.writeUInt16BE(this._buddyCount, offset);
        offset += 2;
        for (let i = 0; i < this._buddies.length; i++) {
            this._buddies[i].serialize().copy(buffer, offset);
            offset += this._buddies[i].size();
        }

        return buffer;
    }
}

export type BuddyInfoRecord = {
    buddyId: number; // 4 bytes
    isBuddy: boolean; // 1 byte
    isOnline: boolean; // 1 byte
    dnd: boolean; // 1 byte
    dnb: boolean; // 1 byte
    noEntry: boolean; // 1 byte
    muteWhispers: boolean; // 1 byte
    muteChat: boolean; // 1 byte
    gameName: string; // 64 bytes
    buddyName: string; // 32 bytes
};

export class BuddyInfo extends LegacyMessage {
    _buddyMap: BuddyMap;
    _isBuddy: boolean; // 1 byte
    _isOnline: boolean; // 1 byte
    _dnd: boolean; // 1 byte
    _dnb: boolean; // 1 byte
    _noEntry: boolean; // 1 byte
    _muteWhispers: boolean; // 1 byte
    _muteChat: boolean; // 1 byte
    _gameName: string; // 64 bytes
    _buddyName: string; // 32 bytes

    constructor() {
        super();
        this._header.id = 0x608;
        this._buddyMap = new BuddyMap();
        this._isBuddy = false;
        this._isOnline = false;
        this._dnd = false;
        this._dnb = false;
        this._noEntry = false;
        this._muteWhispers = false;
        this._muteChat = false;
        this._gameName = "";
        this._buddyName = "";
    }

    static fromRecord(record: BuddyInfoRecord): BuddyInfo {
        const buddyInfo = new BuddyInfo();
        buddyInfo._buddyMap._buddyId = record.buddyId;
        buddyInfo._isBuddy = record.isBuddy;
        buddyInfo._isOnline = record.isOnline;
        buddyInfo._dnd = record.dnd;
        buddyInfo._dnb = record.dnb;
        buddyInfo._noEntry = record.noEntry;
        buddyInfo._muteWhispers = record.muteWhispers;
        buddyInfo._muteChat = record.muteChat;
        buddyInfo._gameName = record.gameName;
        buddyInfo._buddyName = record.buddyName;
        return buddyInfo;
    }

    size(): number {
        return 115 + this._buddyMap.size() + this._header._size;
    }

    override serialize(): Buffer {
        const buffer = Buffer.alloc(this.size());
        let offset = 0;
        this._header._doSerialize().copy(buffer, offset);
        offset += this._header._size;
        this._buddyMap.serialize().copy(buffer, offset);
        offset += 8;
        offset = serializeStringRaw(this._buddyName, buffer, offset, 32);
        offset = serializeStringRaw(this._gameName, buffer, offset, 64);
        buffer.writeUInt8(this._isBuddy ? 1 : 0, offset);
        offset += 1;
        buffer.writeUInt8(this._isOnline ? 1 : 0, offset);
        offset += 1;
        buffer.writeUInt8(this._dnd ? 1 : 0, offset);
        offset += 1;
        buffer.writeUInt8(this._dnb ? 1 : 0, offset);
        offset += 1;
        buffer.writeUInt8(this._noEntry ? 1 : 0, offset);
        offset += 1;
        buffer.writeUInt8(this._muteWhispers ? 1 : 0, offset);
        offset += 1;
        buffer.writeUInt8(this._muteChat ? 1 : 0, offset);

        return buffer;
    }
}

export class BuddyMap extends SerializedBuffer {
    _a2 = 0; // 4 bytes - No clue what this is, appears to always be 0
    _buddyId = 0; // 4 bytes

    constructor() {
        super();
    }

    override size(): number {
        return 8;
    }

    override serialize(): Buffer {
        const buffer = Buffer.alloc(this.size());

        buffer.writeUInt32BE(this._a2, 0);
        buffer.writeUInt32BE(this._buddyId, 4);

        return buffer;
    }
}
