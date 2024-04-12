// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { SerializedBuffer, OldServerMessage } from "rusty-shared";

export class ListEntry extends SerializedBuffer {
    constructor() {
        super();
    }
}

export class LoginCompleteMessage extends SerializedBuffer {
    _msgNo: number;
    _serverTime: number;
    _firstTime: boolean;
    _paycheckWaiting: boolean;
    _clubInvitesWaiting: boolean;
    tallyInProgress: boolean;
    _secondsUntilShutdown: number;
    _shardGNP: number;
    _shardCarsSold: number;
    _shardAverageSalaries: number;
    _shardAverageCarsOwned: number;
    _shardAverageLevel: number;
    constructor() {
        super();
        this._msgNo = 0; // 2 bytes
        this._serverTime = 0; // 4 bytes
        this._firstTime = false; // 1 byte
        this._paycheckWaiting = false; // 1 byte
        this._clubInvitesWaiting = false; // 1 byte
        this.tallyInProgress = false; // 1 byte
        this._secondsUntilShutdown = 0; // 2 bytes

        this._shardGNP = 0; // 4 bytes
        this._shardCarsSold = 0; // 4 bytes
        this._shardAverageSalaries = 0; // 4 bytes
        this._shardAverageCarsOwned = 0; // 4 bytes
        this._shardAverageLevel = 0; // 4 bytes
    }

    override serialize(): Buffer {
        const buffer = Buffer.alloc(this.size());
        let offset = 0;
        buffer.writeUInt16LE(this._msgNo, offset);
        offset += 2;
        buffer.writeUInt32LE(this._serverTime, offset);
        offset += 4;
        buffer.writeUInt8(this._firstTime ? 1 : 0, offset);
        offset += 1;
        buffer.writeUInt8(this._paycheckWaiting ? 1 : 0, offset);
        offset += 1;
        buffer.writeUInt8(this._clubInvitesWaiting ? 1 : 0, offset);
        offset += 1;
        buffer.writeUInt8(this.tallyInProgress ? 1 : 0, offset);
        offset += 1;
        buffer.writeUInt16LE(this._secondsUntilShutdown, offset);
        offset += 2;

        buffer.writeUInt32LE(this._shardGNP, offset);
        offset += 4;
        buffer.writeUInt32LE(this._shardCarsSold, offset);
        offset += 4;
        buffer.writeUInt32LE(this._shardAverageSalaries, offset);
        offset += 4;
        buffer.writeUInt32LE(this._shardAverageCarsOwned, offset);
        offset += 4;
        buffer.writeUInt32LE(this._shardAverageLevel, offset);
        offset += 4;

        return buffer;
    }

    override size() {
        return 34;
    }

    override toString() {
        return `LoginCompleteMessage:
        MsgNo: ${this._msgNo}
        ServerTime: ${this._serverTime}
        FirstTime: ${this._firstTime}
        PaycheckWaiting: ${this._paycheckWaiting}
        ClubInvitesWaiting: ${this._clubInvitesWaiting}
        TallyInProgress: ${this.tallyInProgress}
        SecondsUntilShutdown: ${this._secondsUntilShutdown}
        ShardGNP: ${this._shardGNP}
        ShardCarsSold: ${this._shardCarsSold}
        ShardAverageSalaries: ${this._shardAverageSalaries}
        ShardAverageCarsOwned: ${this._shardAverageCarsOwned}
        ShardAverageLevel: ${this._shardAverageLevel}
        `;
    }
}

export class TLoginMessage extends OldServerMessage {
    _size: number;
    _customerId: number;
    _personaId: number;
    _lotOwnerId: number;
    _brandedPartId: number;
    _skinId: number;
    _personaName: string;
    _mcVersion: string;
    constructor() {
        super();
        this._size = 40;
        this._msgNo = 0; // 2 bytes
        this._customerId = 0; // 4 bytes
        this._personaId = 0; // 4 bytes
        this._lotOwnerId = 0; // 4 bytes
        this._brandedPartId = 0; // 4 bytes
        this._skinId = 0; // 4 bytes
        this._personaName = ""; // 13 bytes
        this._mcVersion = ""; // 4 bytes
    }

    /**
     * @param {Buffer} buffer
     */
    deserialize(buffer: Buffer) {
        let offset = 0;
        this._header._doDeserialize(buffer);
        offset += this._header._size;
        this._msgNo = buffer.readUInt16LE(offset);
        offset += 2;
        this._customerId = buffer.readUInt32LE(offset);
        offset += 4;
        this._personaId = buffer.readUInt32LE(offset);
        offset += 4;
        this._lotOwnerId = buffer.readUInt32LE(offset);
        offset += 4;
        this._brandedPartId = buffer.readUInt32LE(offset);
        offset += 4;
        this._skinId = buffer.readUInt32LE(offset);
        offset += 4;
        this._personaName = buffer.toString("utf8", offset, offset + 13);
        offset += 13;
        this._mcVersion = buffer.toString("utf8", offset, offset + 4);
        // 40 bytes
    }

    override serialize() {
        const buffer = Buffer.alloc(this._size);
        let offset = 0;
        buffer.copy(this._header._doSerialize(), offset);
        offset += this._header._size;
        buffer.writeUInt16LE(this._msgNo, offset);
        offset += 2;
        buffer.writeUInt32LE(this._customerId, offset);
        offset += 4;
        buffer.writeUInt32LE(this._personaId, offset);
        offset += 4;
        buffer.writeUInt32LE(this._lotOwnerId, offset);
        offset += 4;
        buffer.writeUInt32LE(this._brandedPartId, offset);
        offset += 4;
        buffer.writeUInt32LE(this._skinId, offset);
        offset += 4;
        buffer.write(this._personaName, offset, 13, "utf8");
        offset += 13;
        buffer.write(this._mcVersion, offset, 4, "utf8");
        // 40 bytes
        return buffer;
    }

    asJSON() {
        return {
            msgNo: this._msgNo,
            customerId: this._customerId,
            personaId: this._personaId,
            lotOwnerId: this._lotOwnerId,
            brandedPartId: this._brandedPartId,
            skinId: this._skinId,
            personaName: this._personaName,
            mcVersion: this._mcVersion,
        };
    }

    override toString() {
        return `TLoginMessage:
        MsgNo: ${this._msgNo}
        CustomerId: ${this._customerId}
        PersonaId: ${this._personaId}
        LotOwnerId: ${this._lotOwnerId}
        BrandedPartId: ${this._brandedPartId}
        SkinId: ${this._skinId}
        PersonaName: ${this._personaName}
        MCVersion: ${this._mcVersion}
        `;
    }
}
