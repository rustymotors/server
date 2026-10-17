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

import { MessageNode } from "rusty-motors-shared";

const HEADER_SIZE = 11;

export class TClientConnectMessage extends MessageNode {
	_msgNo: number;
	_customerId: number;
	_personaId: number;
	_customerName: string;
	_personaName: string;
	_mcVersion: string;
	constructor() {
		super();
		this._msgNo = 0;
		this._customerId = 0;
		this._personaId = 0;
		this._customerName = "";
		this._personaName = "";
		this._mcVersion = "";
	}

	size() {
		return 51;
	}

	override deserialize(buffer: Buffer): this {
		let offset = 0;
		super.deserialize(buffer);
		offset += HEADER_SIZE;
		this._msgNo = buffer.readUInt16LE(offset);
		offset += 2;
		this._customerId = buffer.readUInt32LE(offset);
		offset += 4;
		this._personaId = buffer.readUInt32LE(offset);
		offset += 4;
		this._customerName = buffer.toString("utf8", offset, offset + 13);
		offset += 13;
		this._personaName = buffer.toString("utf8", offset, offset + 13);
		offset += 13;
		this._mcVersion = buffer.toString("utf8", offset, offset + 4);
		// 51 bytes
		return this;
	}

	override serialize() {
		const buffer = Buffer.alloc(this.size());
		let offset = 0;
		super.serialize().copy(buffer, 0, 0, HEADER_SIZE);
		offset += HEADER_SIZE;
		buffer.writeUInt16LE(this._msgNo, offset);
		offset += 2;
		buffer.writeUInt32LE(this._customerId, offset);
		offset += 4;
		buffer.writeUInt32LE(this._personaId, offset);
		offset += 4;
		buffer.write(this._customerName, offset, 13, "utf8");
		offset += 13;
		buffer.write(this._personaName, offset, 13, "utf8");
		offset += 13;
		buffer.write(this._mcVersion, offset, 4, "utf8");
		// 51 bytes
		return buffer;
	}

	override toString() {
		return `TClientConnectMessage: ${JSON.stringify({
			length: this.length,
			mcoSig: this.signature,
			seq: this.sequence,
			flags: this.flags,
			msgNo: this._msgNo,
			customerId: this._customerId,
			personaId: this._personaId,
			customerName: this._customerName,
			personaName: this._personaName,
			mcVersion: this._mcVersion,
		})}`;
	}
}
