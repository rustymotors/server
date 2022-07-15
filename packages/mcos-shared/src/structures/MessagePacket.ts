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


export class MessagePacket {
  private _buffer: Buffer = Buffer.alloc(0)

  static fromBuffer(buffer: Buffer): MessagePacket {
    const newMessage = new MessagePacket()
    newMessage.setBuffer(buffer)
    return newMessage
  }

  /**
   * Will replace internal buffer without warning
   * @param buffer
   */
  public setBuffer(buffer: Buffer): void {
    this._buffer = buffer
  }

  public get buffer(): Buffer {
    return this._buffer
  }

  private _unpack() {

  }
}
