import type { Serializable, NPSMessage } from './types.js';
import { RawMessageHeader } from './RawMessage.js';
import {
    CBlock,
    checkMinLength,
    checkSize2,
    checkSize4,
    CString,
    padBuffer,
    sliceBuff,
} from './helpers.js';

export class ChannelCreated implements Serializable {
    private _commId // 4
    private _riff: CString // 32
    private _protocol // 4
    private _channelData: CBlock // 256
    private _channelType // 2
    private _maxReadyPlayers // 2

    constructor() {
        this._commId = Buffer.alloc(4)
        this._riff = new CString(32)
        this._protocol = Buffer.alloc(4)
        this._channelData = new CBlock(256)
        this._channelType = Buffer.alloc(2)
        this._maxReadyPlayers = Buffer.alloc(2)
    }

    get sizeOf() {
        return 4 + this._riff.sizeOf + 4 + this._channelData.sizeOf + 2 + 2
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
        offset += this._channelData.sizeOf
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

    set channelData(val: Buffer) {
        sliceBuff(val, 0, this._channelData.sizeOf).copy(this.channelData)
    }

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
    private _riffName: CString; // max 32, null term
    private _protocol: Buffer; // ulong
    private _commId: Buffer; // 4
    private _password: CString; // max 17, null term
    private _channelType: Buffer; // 2
    private _connectedUsersCount: Buffer; // 2
    private _openChannelsCount: Buffer; // 2
    private _isUserConnected: Buffer; // 2 bool
    private _channelData: CBlock; // 256
    private _numReadyPlayers: Buffer; // 2
    private _maxReadyPlayers: Buffer; // 2
    private _channelOwnerId: Buffer; // 4
    private _gameServerIsRunning: Buffer; // char

    constructor() {
        this._riffName = new CString(32);
        this._protocol = Buffer.alloc(4);
        this._commId = Buffer.alloc(4);
        this._password = new CString(17);
        this._channelType = Buffer.alloc(2);
        this._connectedUsersCount = Buffer.alloc(2);
        this._openChannelsCount = Buffer.alloc(2);
        this._isUserConnected = Buffer.alloc(2);
        this._channelData = new CBlock(256);
        this._numReadyPlayers = Buffer.alloc(2);
        this._maxReadyPlayers = Buffer.alloc(2);
        this._channelOwnerId = Buffer.alloc(4);
        this._gameServerIsRunning = Buffer.alloc(1);
    }

    get sizeOf() {
        return 336;
    }

    serialize(): Buffer {
        return Buffer.concat([
            this._riffName.serialize(),
            this._protocol,
            this._commId,
            padBuffer(this._password.serialize()),
            this._channelType,
            this._connectedUsersCount,
            this._openChannelsCount,
            this._isUserConnected,
            this._channelData.serialize(),
            this._numReadyPlayers,
            this._maxReadyPlayers,
            this._channelOwnerId,
            padBuffer(this._gameServerIsRunning),
        ]);
    }

    deserialize(buf: Buffer) {
        checkMinLength(buf, this.sizeOf);
        let offset = 0;
        this._riffName.deserialize(buf);
        offset = offset + this._riffName.sizeOf;
        this._protocol = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._commId = sliceBuff(buf, offset, 4);
        this._password.deserialize(buf.subarray(offset));
        offset = offset + this._password.sizeOf;
        this._channelType = sliceBuff(buf, offset, 2);
        offset = offset + 2;
        this._connectedUsersCount = sliceBuff(buf, offset, 2);
        offset = offset + 2;
        this._openChannelsCount = sliceBuff(buf, offset, 2);
        offset = offset + 2;
        this._isUserConnected = sliceBuff(buf, offset, 2);
        offset = offset + 2;
        this._channelData.deserialize(
            sliceBuff(buf, offset, this._channelData.sizeOf),
        );
        offset = offset + this._channelData.sizeOf;
        this._numReadyPlayers = sliceBuff(buf, offset, 2);
        offset = offset + 2;
        this._maxReadyPlayers = sliceBuff(buf, offset, 2);
        offset = offset + 2;
        this._channelOwnerId = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._gameServerIsRunning = sliceBuff(buf, offset, 1);
    }

    get riffName() {
        return this._riffName.toString();
    }
    get protocol() {
        return this._protocol;
    }
    get commId() {
        return this._commId;
    }
    get password() {
        return this._password.toString();
    }
    get channelType() {
        return this._channelType;
    }
    get connectedUsersCount() {
        return this._connectedUsersCount;
    }
    get openChannelsCount() {
        return this._openChannelsCount;
    }
    get isUserConnected() {
        return this._isUserConnected;
    }
    get channelData() {
        return this._channelData.serialize();
    }
    get numReadyPlayers() {
        return this._numReadyPlayers;
    }
    get maxReadyPlayers() {
        return this._maxReadyPlayers;
    }
    get channelOwnerId() {
        return this.channelOwnerId;
    }
    get gameServerIsRunning() {
        return this._gameServerIsRunning;
    }

    set riffName(val: string) {
        this._riffName.set(val);
    }
    set protocol(val: Buffer) {
        this.protocol = val;
    }
    set commId(val: Buffer) {
        this._commId = val;
    }
    set password(val: string) {
        this._password.set(val);
    }
    set channelType(val: Buffer) {
        this._channelType = val;
    }
    set connectedUsersCount(val: Buffer) {
        this._connectedUsersCount = val;
    }
    set openChannelsCount(val: Buffer) {
        this._openChannelsCount = val;
    }
    set isUserConnected(val: Buffer) {
        this._isUserConnected = val;
    }
    set channelData(val: Buffer) {
        this._channelData.deserialize(val);
    }
    set numReadyPlayers(val: Buffer) {
        this._numReadyPlayers = val;
    }
    set maxReadyPlayers(val: Buffer) {
        this._maxReadyPlayers = val;
    }
    set channelOwnerId(val: Buffer) {
        this._channelOwnerId = val;
    }
    set gameServerIsRunning(val: Buffer) {
        this._gameServerIsRunning = val;
    }
}

export class RiffList implements Serializable {
    private _riffs: RiffInfo[];

    constructor() {
        this._riffs = [];
    }

    get sizeOf() {
        return 336 * this._riffs.length;
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
    private _header: RawMessageHeader;
    private _riffListHeader: RiffListHeader;
    private _riffs: RiffList;

    constructor() {
        this._header = new RawMessageHeader();
        this._riffListHeader = new RiffListHeader();
        this._riffs = new RiffList();
    }

    get sizeOf() {
        return (
            this._header.sizeOf +
            this._riffListHeader.sizeOf +
            336 * this._riffListHeader.numRiffs
        );
    }

    serialize() {
        this._riffListHeader.numRiffs = this._riffs.length;

        return Buffer.concat([
            this._header.serialize(),
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
        return this._header.id;
    }

    set id(val: number) {
        checkSize2(val);
        this._header.id = val;
    }

    get length() {
        return this._header.length;
    }
}
