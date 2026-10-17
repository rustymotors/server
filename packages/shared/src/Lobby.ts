import type { Serializable, NPSMessage } from './types.js';
import {
    checkMinLength,
    checkSize2,
    checkSize4,
    CString,
    Long,
    Short,
    sliceBuff,
} from './helpers.js';
import { BytableChannelData } from '@rustymotors/binary';

export class ChannelCreated implements Serializable {
    private _commId // 4
    private _riff: CString // 32
    private _protocol // 4
    private _channelData: BytableChannelData // 256
    private _channelType // 2
    private _maxReadyPlayers // 2

    constructor() {
        this._commId = Buffer.alloc(4)
        this._riff = new CString(32)
        this._protocol = Buffer.alloc(4)
        this._channelData = new BytableChannelData()
        this._channelType = Buffer.alloc(2)
        this._maxReadyPlayers = Buffer.alloc(2)
    }

    get sizeOf() {
        return 4 + this._riff.sizeOf + 4 + this._channelData.serializeSize + 2 + 2
    }

    serialize() {
        return Buffer.concat([
            this._commId,
            this._riff.serialize(),
            this._protocol,
            this._channelData.serialize(),
            this._channelType,
            this._maxReadyPlayers
        ])        
    };

    deserialize(buf: Buffer) {
        checkMinLength(buf, this.sizeOf)
        let offset = 0
        this._commId = sliceBuff(buf, offset, 4)
        offset += 4
        this._riff.deserialize(buf.subarray(offset))
        offset+= this._riff.sizeOf
        this._protocol = sliceBuff(buf, offset, 4)
        offset +=4
        this._channelData.deserialize(buf.subarray(offset))
        offset += this._channelData.serializeSize
        this._channelType = sliceBuff(buf, offset, 2)
        offset += 2
        this._maxReadyPlayers = sliceBuff(buf, offset, 2)
    };

    toString() {
        return JSON.stringify(this)
    }

    set commId(val: number) {
        checkSize4(val)
        this._commId.writeInt32BE(val)
    }

    set riff(val: string) {
        this._riff.set(val)
    }

    set protocol(val: number) {
        checkSize4(val)
        this._protocol.writeInt32BE(val)
    }

    get channelData(): BytableChannelData { return this._channelData; }
    set channelData(val: BytableChannelData) { this._channelData = val; }

    set channelType(val: number) {
        checkSize2(val)
        this._channelType.writeInt16BE(val)
    }

    set maxReadyPlayers(val: number) {
        checkSize2(val)
        this._maxReadyPlayers.writeInt16BE(val)
    }
}

export class RiffInfo implements Serializable {
    // pllpssssbsslc
    private _riffName: CString; // max 32, null term (p)
    private _protocol: Long; // ulong (l)
    private _commId: Long; // 4 (l)
    private _password: CString; // max 17, null term (p)
    private _channelType: Short; // 2 (s)
    private _connectedUsersCount: Short; // 2 (s)
    private _openChannelsCount: Short; // 2 (s)
    private _isUserConnected: Short; // 2 bool (s)
    private _channelData: BytableChannelData; // 256 (b)
    private _numReadyPlayers: Short; // 2 (s)
    private _maxReadyPlayers: Short; // 2 (s)
    private _channelOwnerId: Long; // 4 (l)
    private _gameServerIsRunning: Long; // char (c)

    constructor() {
        this._riffName = new CString(32);
        this._protocol = new Long();
        this._commId = new Long();
        this._password = new CString(17);
        this._channelType = new Short();
        this._connectedUsersCount = new Short();
        this._openChannelsCount = new Short();
        this._isUserConnected = new Short();
        this._channelData = new BytableChannelData();
        this._numReadyPlayers = new Short();
        this._maxReadyPlayers = new Short();
        this._channelOwnerId = new Long();
        this._gameServerIsRunning = new Long();
    }

    get sizeOf() {
        return 339;
    }

    serialize(): Buffer {
        return Buffer.concat([
            this._riffName.serialize(),       // char[32]  @0
            this._protocol.serialize(),        // ulong     @32
            this._commId.serialize(),          // long      @36
            this._password.serialize(),        // char[17]  @40
            Buffer.alloc(1),                   // pad       @57
            this._channelType.serialize(),     // short     @58
            this._connectedUsersCount.serialize(), // short @60
            this._openChannelsCount.serialize(),   // short @62
            this._isUserConnected.serialize(), // short     @64
            this._channelData.serialize(),     // char[256] @66
            this._numReadyPlayers.serialize(), // ushort    @322
            this._maxReadyPlayers.serialize(), // ushort    @324
            Buffer.alloc(2),                   // pad       @326
            this._channelOwnerId.serialize(),  // ulong     @328
            this._gameServerIsRunning.serialize(), // int   @332
            Buffer.alloc(3),                   // pad       @336
        ]);
    }

    deserialize(buf: Buffer) {
        checkMinLength(buf, this.sizeOf);
        let offset = 0;
        this._riffName.deserialize(buf);
        offset = offset + this._riffName.sizeOf;
        this._protocol.deserialize(sliceBuff(buf, offset, 4));
        offset = offset + 4;
        this._commId.deserialize(sliceBuff(buf, offset, 4));
        this._password.deserialize(buf.subarray(offset));
        offset = offset + this._password.sizeOf;
        this._channelType.deserialize(sliceBuff(buf, offset, 2));
        offset = offset + 2;
        this._connectedUsersCount.deserialize(sliceBuff(buf, offset, 2));
        offset = offset + 2;
        this._openChannelsCount.deserialize(sliceBuff(buf, offset, 2));
        offset = offset + 2;
        this._isUserConnected.deserialize(sliceBuff(buf, offset, 2));
        offset = offset + 2;
        this._channelData.deserialize(
            sliceBuff(buf, offset, this._channelData.serializeSize),
        );
        offset = offset + this._channelData.serializeSize;
        this._numReadyPlayers.deserialize(sliceBuff(buf, offset, 2));
        offset = offset + 2;
        this._maxReadyPlayers.deserialize(sliceBuff(buf, offset, 2));
        offset = offset + 2;
        this._channelOwnerId.deserialize(sliceBuff(buf, offset, 4));
        offset = offset + 4;
        this._gameServerIsRunning.deserialize(sliceBuff(buf, offset, 1));
    }

    get riffName() {
        return this._riffName.toString();
    }
    get protocol() {
        return this._protocol.value;
    }
    get commId() {
        return this._commId.value;
    }
    get password() {
        return this._password.toString();
    }
    get channelType() {
        return this._channelType.value;
    }
    get connectedUsersCount() {
        return this._connectedUsersCount.value;
    }
    get openChannelsCount() {
        return this._openChannelsCount.value;
    }
    get isUserConnected(): boolean {
        return this._isUserConnected.value === 1 ? true : false;
    }
    get channelData(): BytableChannelData {
        return this._channelData;
    }
    get numReadyPlayers() {
        return this._numReadyPlayers.value;
    }
    get maxReadyPlayers() {
        return this._maxReadyPlayers.value;
    }
    get channelOwnerId() {
        return this._channelOwnerId.value;
    }
    get gameServerIsRunning() {
        return this._gameServerIsRunning.value === 1 ? true : false;
    }

    set riffName(val: string) {
        this._riffName.set(val);
    }
    set protocol(val: number) {
        this._protocol.value = val;
    }
    set commId(val: number) {
        this._commId.value = val;
    }
    set password(val: string) {
        this._password.set(val);
    }
    set channelType(val: number) {
        this._channelType.value = val;
    }
    set connectedUsersCount(val: number) {
        this._connectedUsersCount.value = val;
    }
    set openChannelsCount(val: number) {
        this._openChannelsCount.value = val;
    }
    set isUserConnected(val: boolean) {
        this._isUserConnected.value = val ? 1 : 0;
    }
    set channelData(val: BytableChannelData) {
        this._channelData = val;
    }
    set numReadyPlayers(val: number) {
        this._numReadyPlayers.value = val;
    }
    set maxReadyPlayers(val: number) {
        this._maxReadyPlayers.value = val;
    }
    set channelOwnerId(val: number) {
        this._channelOwnerId.value = val;
    }
    set gameServerIsRunning(val: boolean) {
        this._gameServerIsRunning.value = val ? 1 : 0;
    }
}

export class RiffList implements Serializable {
    private _riffs: RiffInfo[];

    constructor() {
        this._riffs = [];
    }

    get sizeOf() {
        return 339 * this._riffs.length;
    }

    serialize() {
        const riffs = this._riffs.map((riff) => {
            return riff.serialize();
        });
        return Buffer.concat(riffs);
    }

    deserialize(_buf: Buffer) {
        throw new Error('Why are we trying to deserialize a riff list?');
    }

    add(riff: RiffInfo) {
        this._riffs.push(riff);
    }

    get length() {
        return this._riffs.length;
    }
}

export class RiffListHeader implements Serializable {
    private _structSize; // long
    private _numRiffs; // long

    constructor() {
        this._structSize = Buffer.alloc(4);
        this._numRiffs = Buffer.alloc(4);
    }

    get sizeOf() {
        return 8;
    }

    serialize() {
        return Buffer.concat([this._structSize, this._numRiffs]);
    }

    deserialize(buf: Buffer) {
        if (buf.byteLength < this.sizeOf) {
            throw new Error(``);
        }
    }

    get numRiffs() {
        return this._numRiffs.readInt32BE();
    }

    set numRiffs(val: number) {
        checkSize4(val);
        this._numRiffs.writeInt32BE(val);
    }
}

export class RiffInfoListMessage implements NPSMessage {
    private _id = 0;
    private _riffListHeader: RiffListHeader;
    private _riffs: RiffList;

    constructor() {
        this._riffListHeader = new RiffListHeader();
        this._riffs = new RiffList();
    }

    get sizeOf() {
        return (
            4 +
            this._riffListHeader.sizeOf +
            336 * this._riffListHeader.numRiffs
        );
    }

    serialize() {
        this._riffListHeader.numRiffs = this._riffs.length;
        const header = Buffer.alloc(4);
        header.writeUInt16BE(this._id, 0);
        // length field left as 0 (was never set in original)

        return Buffer.concat([
            header,
            this._riffListHeader.serialize(),
            this._riffs.serialize(),
        ]);
    }

    deserialize(_buf: Buffer) {
        throw new Error(
            'Why are we trying to deserialize a RiffInfoList message?',
        );
    }

    get id() {
        return this._id;
    }

    set id(val: number) {
        checkSize2(val);
        this._id = val;
    }

    get length() {
        return 0; // matches original: RawMessageHeader.length was never set
    }

    addRiff(riff: RiffInfo) {
        this._riffs.add(riff)
    }
}
