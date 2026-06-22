import {
    CString,
    Long,
    NPS_LOGICAL,
    checkMinLength,
    checkSize2,
    checkSize4,
    sliceBuff,
} from './helpers.js';
import { RawMessageHeader } from './RawMessageHeader.js';
import { SerializedList } from './SerializedList.js';
import type { IRunningServerInfo, NPSMessage, Serializable } from './types.js';

export class GameServerLaunchInfo implements Serializable {
    private _commId; // 4
    private _bestHost; // ip - 16

    constructor() {
        this._commId = Buffer.alloc(4);
        this._bestHost = new CString(16);
    }

    get sizeOf() {
        return 4 + this._bestHost.sizeOf;
    }

    serialize() {
        return Buffer.concat([this._commId, this._bestHost.serialize()]);
    }

    deserialize(buf: Buffer) {
        checkMinLength(buf, this.sizeOf);
        this._commId = sliceBuff(buf, 0, 4);
        this._bestHost.deserialize(buf.subarray(4));
    }

    get commId() {
        return this._commId.readInt32BE();
    }

    get bestHost() {
        return this._bestHost.toString();
    }
}

// export class Lobby implements Serializable { }
export class RunningServerInfo implements IRunningServerInfo, Serializable {
    private _riff; // p
    private _commId; // l
    private _ipAddress; // p
    private _port; // l
    private _userId; // l
    private _numberOfPlayers; // l

    constructor() {
        this._riff = new CString(32);
        this._commId = Buffer.alloc(4);
        this._ipAddress = new CString(16);
        this._port = Buffer.alloc(4);
        this._userId = Buffer.alloc(4);
        this._numberOfPlayers = Buffer.alloc(4);
    }

    get sizeOf() {
        return this._riff.sizeOf + 4 + this._ipAddress.sizeOf + 4 + 4 + 4;
    }

    serialize(): Buffer {
        return Buffer.concat([
            this._riff.serialize(),
            this._commId,
            this._ipAddress.serialize(),
            this._port,
            this._userId,
            this._numberOfPlayers,
        ]);
    }

    deserialize(_buf: Buffer) {
        throw new Error(`Not yet`);
    }

    set riff(val: string) {
        this._riff.set(val);
    }

    get commId() {
        return this._commId.readInt32BE();
    }

    set commId(val: number) {
        checkSize4(val);
        this._commId.writeInt32BE(val);
    }

    get ipAddress() {
        return this._ipAddress.toString();
    }

    set ipAddress(val: string) {
        this._ipAddress.set(val);
    }

    get port() {
        return this._port.readInt32BE();
    }

    set port(val: number) {
        checkSize4(val);
        this._port.writeInt32BE(val);
    }

    get userId() {
        return this._userId.readInt32BE();
    }

    set userId(val: number) {
        checkSize4(val);
        this._userId.writeInt32BE(val);
    }

    get numberOfPlayers() {
        return this._numberOfPlayers.readInt32BE();
    }

    set numberOfPlayers(val: number) {
        checkSize4(val);
        this._numberOfPlayers.writeInt32BE(val);
    }
}
/**
 * NPS_GameServersInfo is the message passed back in response to
 * GetGameServersList (NPS_GAME_SERVERS_LIST).
 */

export class GameServerInfo implements Serializable {
    private _groupDescription: CString = new CString(65); // string max 64 + 1
    private _serverName: CString = new CString(65); // string 64 max len + 1
    private _serverIp: CString = new CString(65); // string 64 max len + 1

    constructor(name: string, ip: string) {
        this._groupDescription.set('0');
        this._serverName.set(name);
        this._serverIp.set(ip);
    }

    get sizeOf() {
        return (
            this._groupDescription.sizeOf +
            this._serverName.sizeOf +
            this._serverIp.sizeOf
        );
    }

    deserialize(buf: Buffer) {
        let offset = 0;
        this._groupDescription.deserialize(buf.subarray(offset));
        offset = offset + this._groupDescription.sizeOf;
        this._serverName.deserialize(buf.subarray(offset));
        offset = offset + this._serverName.sizeOf;
        this._serverIp.deserialize(buf.subarray(offset));
    }

    serialize(): Buffer {
        return Buffer.concat([
            this._groupDescription.serialize(),
            this._serverName.serialize(),
            this._serverIp.serialize(),
        ]);
    }
}

export class GameServerList implements Serializable {
    private _gameServers: GameServerInfo[];

    constructor() {
        this._gameServers = [];
    }

    get sizeOf() {
        return 195 * this._gameServers.length;
    }

    serialize() {
        const gameServer = this._gameServers.map((gameServer) => {
            return gameServer.serialize();
        });
        return Buffer.concat(gameServer);
    }

    deserialize(_buf: Buffer) {
        throw new Error('Why are we trying to deserialize a game server list?');
    }

    add(gameServer: GameServerInfo) {
        this._gameServers.push(gameServer);
    }

    get length() {
        return this._gameServers.length;
    }
}

export class GameServerListHeader implements Serializable {
    private _structSize; // long
    private _numGameServers; // long

    constructor() {
        this._structSize = Buffer.alloc(4);
        this._numGameServers = Buffer.alloc(4);
    }

    get sizeOf() {
        return 8;
    }

    serialize() {
        return Buffer.concat([this._structSize, this._numGameServers]);
    }

    deserialize(buf: Buffer) {
        if (buf.byteLength < this.sizeOf) {
            throw new Error(``);
        }
    }

    get numGameServers() {
        return this._numGameServers.readInt32BE();
    }

    set numGameServers(val: number) {
        checkSize4(val);
        this._numGameServers.writeInt32BE(val);
    }

    get structSize() {
        return this._structSize.readInt32BE();
    }

    set structSize(val: number) {
        checkSize4(val);
        this._structSize.writeInt32BE(val);
    }
}

export class GameServerListMessage implements NPSMessage {
    private _header: RawMessageHeader;
    private _gameServerListHeader: GameServerListHeader;
    private _gameServers: GameServerList;

    constructor() {
        this._header = new RawMessageHeader();
        this._gameServerListHeader = new GameServerListHeader();
        this._gameServers = new GameServerList();
    }

    get sizeOf() {
        return (
            this._header.sizeOf +
            this._gameServerListHeader.sizeOf +
            195 * this._gameServerListHeader.numGameServers
        );
    }

    serialize() {
        this._gameServerListHeader.numGameServers = this._gameServers.length;
        this._gameServerListHeader.structSize = this.sizeOf;

        return Buffer.concat([
            this._header.serialize(),
            this._gameServerListHeader.serialize(),
            this._gameServers.serialize(),
        ]);
    }

    deserialize(_buf: Buffer) {
        throw new Error(
            'Why are we trying to deserialize a GameServerList message?',
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

    add(gameServer: GameServerInfo) {
        this._gameServers.add(gameServer);
    }
}

export class ReadyForGame implements Serializable {
    // NPS_READY_LIST (0x210) wire format: count(4) + N×{ CommId(4), UserId(4), isReady(2), isMaster(2) }
    // NPSDll stride=12 bytes/entry. Confirmed from 0x109 handler:
    //   offset 0: commId (int32), offset 4: userId (int32),
    //   offset 8: isReady (NPS_LOGICAL/int16), offset 10: isMaster (NPS_LOGICAL/int16)
    private _commId = new Long();          // 4
    private _userId = new Long();          // 4
    private _isReady = new NPS_LOGICAL();  // 2
    private _isMaster = new NPS_LOGICAL(); // 2

    constructor(commId: number, userId: number, isReady = false, isMaster = false) {
        this._commId.value = commId;
        this._userId.value = userId;
        this._isReady.value = isReady;
        this._isMaster.value = isMaster;
    }

    get sizeOf() {
        return 12;
    }

    deserialize(_buf: Buffer) {
        throw new Error('Not yet implemented');
    }

    serialize() {
        return Buffer.concat([
            this._commId.serialize(),
            this._userId.serialize(),
            this._isReady.serialize(),
            this._isMaster.serialize(),
        ]);
    }
}

export class ReadyForGameList extends SerializedList<ReadyForGame> {}
