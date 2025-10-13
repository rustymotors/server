import {
    CString,
    checkMinLength,
    checkSize2,
    checkSize4,
    sliceBuff,
} from './helpers.js';
import { RawMessageHeader } from './RawMessage.js';
import { NPSMessage, Serializable } from './types.js';

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
// export class RunningServerInfo implements Serializable { }
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
