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

export { SubThread } from './src/SubThread.js';
export { NetworkMessage } from './src/NetworkMessage.js';
export { Configuration, getServerConfiguration } from './src/Configuration.js';
export { SerializedBuffer } from './src/SerializedBuffer.js';
export { SerializedBufferOld } from './src/SerializedBufferOld.js';
export { RawMessage } from './src/RawMessage.js';
export { ServerMessage } from './src/ServerMessage.js';
export {
    AbstractSerializable,
    SerializableMixin,
} from './src/messageFactory.js';
export { NPSMessage } from './src/NPSMessage.js';
export { OldServerMessage } from './src/OldServerMessage.js';
export { MessageBufferOld } from './src/MessageBufferOld.js';
export { GameMessage } from './src/GameMessage.js';
export { serializeString } from './src/serializeString.js';
export { deserializeString } from './src/deserializeString.js';
export { serializeStringRaw } from './src/serializeStringRaw.js';
export { MessageNode } from './src/MessageNode.js';
export { Timestamp } from './src/TimeStamp.js';
export {
    McosEncryptionPair,
    McosEncryption,
    addSession,
    createInitialState,
    fetchStateFromDatabase,
    addEncryption,
    getEncryption,
    McosSession,
    findSessionByConnectionId,
    updateEncryption,
} from './src/State.js';
export { ensureLegacyCipherCompatibility as verifyLegacyCipherSupport } from './src/verifyLegacyCipherSupport.js';
export type { State } from './src/State.js';
export type { OnDataHandler, ServiceResponse } from './src/State.js';
export { LegacyMessage } from './src/LegacyMessage.js';
export * from './src/types.js';
export * from './src/utility.js';
