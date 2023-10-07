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

import {
    SerializedBuffer,
    serializeString,
} from "../../shared/messageFactory.js";

/**
 * A message listing the lobbies
 * This is the body of a MessageNode
 */
export class GameUrlsMessage extends SerializedBuffer {
    _msgNo: number;
    _urlCount: number;
    _shouldExpectMoreMessages: boolean;
    _urlList: GameUrl[];
    constructor() {
        super();
        this._msgNo = 0; // 2 bytes
        this._urlCount = 0; // 2 bytes
        this._shouldExpectMoreMessages = false; // 1 byte
        /** @type {GameUrl[]} */
        this._urlList = []; // 563 bytes each
    }

    override size() {
        return 5 + this._urlList.length * 563;
    }

    /**
     * Add a lobby to the list
     * @param {GameUrl} lobby
     */
    addURL(lobby: GameUrl) {
        this._urlList.push(lobby);
        this._urlCount++;
    }

    override serialize() {
        const neededSize = 4 + this._urlList.length * 563;
        const buffer = Buffer.alloc(neededSize);
        let offset = 0; // offset is 0
        buffer.writeUInt16LE(this._msgNo, offset);
        offset += 2; // offset is 2
        buffer.writeUInt16LE(this._urlCount, offset);
        offset += 2; // offset is 4
        buffer.writeUInt8(this._shouldExpectMoreMessages ? 1 : 0, offset);
        offset += 1; // offset is 5
        for (const url of this._urlList) {
            url.serialize().copy(buffer, offset);
            offset += url.size();
        }
        // offset is now 4 + this._lobbyList.length * 563
        return buffer;
    }

    override toString() {
        return `GameUrlsMessage: msgNo=${this._msgNo} urlCount=${this._urlCount} shouldExpectMoreMessages=${this._shouldExpectMoreMessages} urlList=${this._urlList}`;
    }
}

export class GameUrl extends SerializedBuffer {
    _urlId: number;
    urlRef: string;
    constructor() {
        super();
        this._urlId = 0; // 4 bytes
        this.urlRef = ""; // 4 + this.urlRef.length bytes
    }

    override size() {
        return 8 + this.urlRef.length;
    }

    override serialize() {
        const buffer = Buffer.alloc(this.size());
        let offset = 0; // offset is 0
        buffer.writeUInt32LE(this._urlId, offset);
        offset += 4; // offset is 4
        serializeString(this.urlRef, buffer, offset);

        return buffer;
    }

    override toString() {
        return `GameUrl: urlId=${this._urlId} urlRef=${this.urlRef}`;
    }
}
