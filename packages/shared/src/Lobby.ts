import { Serializable, NPSMessage } from "./types.js"
import { RawMessageHeader } from "./RawMessage.js"
import { CBlock, checkMinLength, checkSize2, checkSize4, CString, padBuffer, sliceBuff } from "./helpers.js"

// export class Lobby implements Serializable { }

// export class RunningServerInfo implements Serializable { }
/**
 * NPS_GameServersInfo is the message passed back in response to
 * GetGameServersList (NPS_GAME_SERVERS_LIST).
 */
export class GameServerInfo implements Serializable {
    private _groupDescription: CString = new CString(65) // string max 64 + 1
    private _serverName: CString = new CString(65) // string 64 max len + 1
    private _serverIp: CString = new CString(65) // string 64 max len + 1

    constructor(name: string, ip: string) {
        this._groupDescription.set("0")
        this._serverName.set(name)
        this._serverIp.set(ip)
    }

    get sizeOf() {
        return this._groupDescription.sizeOf + this._serverName.sizeOf + this._serverIp.sizeOf
    }

    deserialize(buf: Buffer) {
        let offset = 0
        this._groupDescription.deserialize(buf.subarray(offset))
        offset = offset + this._groupDescription.sizeOf
        this._serverName.deserialize(buf.subarray(offset))
        offset = offset + this._serverName.sizeOf
        this._serverIp.deserialize(buf.subarray(offset))
    };

    serialize(): Buffer {
        return Buffer.concat([
            this._groupDescription.serialize(),
            this._serverName.serialize(),
            this._serverIp.serialize()
        ])
    }
}

export class GameServerList implements Serializable {
    private _gameServers: GameServerInfo[]

    constructor() {
        this._gameServers = []
    }

    get sizeOf() {
        return 195 * this._gameServers.length
    }

    serialize() {
        const gameServer = this._gameServers.map(gameServer => {
            return gameServer.serialize()
        })
        return Buffer.concat(
            gameServer
        )
    };

    deserialize(_buf: Buffer) {
        throw new Error('Why are we trying to deserialize a game server list?')
    };

    add(gameServer: GameServerInfo) {
        this._gameServers.push(gameServer)
    }

    get length() {
        return this._gameServers.length
    }
}


export class GameServerListHeader implements Serializable {
    private _structSize // long
    private _numGameServers // long
    
    constructor() {
        this._structSize = Buffer.alloc(4)
        this._numGameServers = Buffer.alloc(4)
    }
    
    get sizeOf() {
        return 8
    };
    
    serialize() {
        return Buffer.concat([
            this._structSize,
            this._numGameServers
        ])
    };
    
    deserialize(buf: Buffer) {
        if (buf.byteLength < this.sizeOf) {
            throw new Error(``)
        }
    };
    
    get numGameServers() {
        return this._numGameServers.readInt32BE()
    }
    
    set numGameServers(val: number) {
        checkSize4(val)
        this._numGameServers.writeInt32BE(val)
    }
}

export class GameServerListMessage implements NPSMessage {
private _header: RawMessageHeader
private _gameServerListHeader: GameServerListHeader
    private _gameServers: GameServerList

    constructor() {
        this._header = new RawMessageHeader()
        this._gameServerListHeader = new GameServerListHeader()
        this._gameServers = new GameServerList()
    }

    get sizeOf() {
        return this._header.sizeOf + this._gameServerListHeader.sizeOf + (195 * this._gameServerListHeader.numGameServers)
    };

    serialize() {
        this._gameServerListHeader.numGameServers = this._gameServers.length

        return Buffer.concat([
            this._header.serialize(),
            this._gameServerListHeader.serialize(),
            this._gameServers.serialize()
        ])
    };

    deserialize(_buf: Buffer) {
        throw new Error('Why are we trying to deserialize a GameServerList message?')
    };

    get id() {
        return this._header.id
    }

    set id(val: number) {
        checkSize2(val)
        this._header.id = val
    }

    get length() {
        return this._header.length
    };

    add(gameServer: GameServerInfo) {
        this._gameServers.add(gameServer)
    }
}




export class RiffInfo implements Serializable {
    private _riffName: CString // max 32, null term
    private _protocol: Buffer // ulong
    private _commId: Buffer // 4
    private _password: CString // max 17, null term
    private _channelType: Buffer// 2
    private _connectedUsersCount: Buffer // 2
    private _openChannelsCount: Buffer // 2
    private _isUserConnected: Buffer // 2 bool
    private _channelData: CBlock // 256
    private _numReadyPlayers: Buffer // 2
    private _maxReadyPlayers: Buffer // 2
    private _channelOwnerId: Buffer // 4
    private _gameServerIsRunning: Buffer // char

    constructor() {
        this._riffName = new CString(32)
        this._protocol = Buffer.alloc(4)
        this._commId = Buffer.alloc(4)
        this._password = new CString(17)
        this._channelType = Buffer.alloc(2)
        this._connectedUsersCount = Buffer.alloc(2)
        this._openChannelsCount = Buffer.alloc(2)
        this._isUserConnected = Buffer.alloc(2)
        this._channelData = new CBlock(256)
        this._numReadyPlayers = Buffer.alloc(2)
        this._maxReadyPlayers = Buffer.alloc(2)
        this._channelOwnerId = Buffer.alloc(4)
        this._gameServerIsRunning = Buffer.alloc(1)
    }

    get sizeOf() {
        return 336
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
            padBuffer(this._gameServerIsRunning)
        ])
    }

    deserialize(buf: Buffer) {
        checkMinLength(buf, this.sizeOf)
        let offset = 0
        this._riffName.deserialize(buf)
        offset = offset + this._riffName.sizeOf
        this._protocol = sliceBuff(buf, offset, 4)
        offset = offset + 4
        this._commId = sliceBuff(buf, offset, 4)
        this._password.deserialize(buf.subarray(offset))
        offset = offset + this._password.sizeOf
        this._channelType = sliceBuff(buf, offset, 2)
        offset = offset + 2
        this._connectedUsersCount = sliceBuff(buf, offset, 2)
        offset = offset + 2
        this._openChannelsCount = sliceBuff(buf, offset, 2)
        offset = offset + 2
        this._isUserConnected = sliceBuff(buf, offset, 2)
        offset = offset + 2
        this._channelData.deserialize(sliceBuff(buf, offset, this._channelData.sizeOf))
        offset = offset + this._channelData.sizeOf
        this._numReadyPlayers = sliceBuff(buf, offset, 2)
        offset = offset + 2
        this._maxReadyPlayers = sliceBuff(buf, offset, 2)
        offset = offset + 2
        this._channelOwnerId = sliceBuff(buf, offset, 4)
        offset = offset + 4
        this._gameServerIsRunning = sliceBuff(buf, offset, 1)
        
    };
}

export class RiffList implements Serializable {
    private _riffs: RiffInfo[]

    constructor() {
        this._riffs = []
    }

    get sizeOf() {
        return 336 * this._riffs.length
    }

    serialize() {
        const riffs = this._riffs.map(riff => {
            return riff.serialize()
        })
        return Buffer.concat(
            riffs
        )
    };

    deserialize(_buf: Buffer) {
        throw new Error('Why are we trying to deserialize a riff list?')
    };

    add(riff: RiffInfo) {
        this._riffs.push(riff)
    }

    get length() {
        return this._riffs.length
    }
}

export class RiffListHeader implements Serializable {
    private _structSize // long
    private _numRiffs // long

    constructor() {
        this._structSize = Buffer.alloc(4)
        this._numRiffs = Buffer.alloc(4)
    }

    get sizeOf() {
        return 8
    };

    serialize() {
        return Buffer.concat([
            this._structSize,
            this._numRiffs
        ])
    };

    deserialize(buf: Buffer) {
        if (buf.byteLength < this.sizeOf) {
            throw new Error(``)
        }
    };

    get numRiffs() {
        return this._numRiffs.readInt32BE()
    }

    set numRiffs(val: number) {
        checkSize4(val)
        this._numRiffs.writeInt32BE(val)
    }
}

export class RiffInfoListMessage implements NPSMessage {
    private _header: RawMessageHeader
    private _riffListHeader: RiffListHeader
    private _riffs: RiffList

    constructor() {
        this._header = new RawMessageHeader()
        this._riffListHeader = new RiffListHeader()
        this._riffs = new RiffList()
    }

    get sizeOf() {
        return this._header.sizeOf + this._riffListHeader.sizeOf + (336 * this._riffListHeader.numRiffs)
    };

    serialize() {
        this._riffListHeader.numRiffs = this._riffs.length

        return Buffer.concat([
            this._header.serialize(),
            this._riffListHeader.serialize(),
            this._riffs.serialize()
        ])
    };

    deserialize(_buf: Buffer) {
        throw new Error('Why are we trying to deserialize a RiffInfoList message?')
    };

    get id() {
        return this._header.id
    }

    set id(val: number) {
        checkSize2(val)
        this._header.id = val
    }

    get length() {
        return this._header.length
    };
}


