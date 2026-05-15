import { getPersonaByPersonaId } from 'rusty-motors-authentication';
import {
    createCommandEncryptionPair,
    createDataEncryptionPair,
} from 'rusty-motors-gateway';
import { BytableMessage, BytableBuffer } from '@rustymotors/binary';
import {
    type ConnectionRecord,
    McosEncryption,
    type ServerLogger,
    type State,
    addEncryption,
    databaseProvider,
    deserializeString,
    fetchStateFromDatabase,
    getEncryption,
    getServerLogger,
    type ISessionStore,
    serializeString,
} from 'rusty-motors-shared';
import type { RoomHandlerArgs, RoomHandlerResult } from './registry.js';

const NPS_INVALID_KEY = 0x22a;

const LEGACY_HEADER_SIZE = 4;

class LoginInfoMessage extends BytableMessage {
    _userId: number;
    _userName: string;
    _userData: Buffer;
    _customerId: number;
    _flags: number;
    _dllVersion: string;
    _hostname: string;
    _idAddress: string;
    _hashKey: Buffer;

    constructor() {
        super(0); // version 0 = 4-byte header
        this._userId = 0;
        this._userName = '';
        this._userData = Buffer.alloc(64);
        this._customerId = 0;
        this._flags = 0;
        this._dllVersion = '';
        this._hostname = '';
        this._idAddress = '';
        this._hashKey = Buffer.alloc(16);
    }

    override deserialize(buffer: Buffer): this {
        try {
            this.header.deserialize(buffer);
            let offset = LEGACY_HEADER_SIZE;
            this._userId = buffer.readUInt32BE(offset);
            offset += 4;
            this._userName = deserializeString(buffer.subarray(offset));
            offset += 4 + this._userName.length + 1;
            buffer.copy(this._userData, 0, offset, offset + 64);
            offset += 64;
            this._customerId = buffer.readUInt32BE(offset);
            offset += 4;
            this._flags = buffer.readUInt32BE(offset);
            offset += 4;
            this._dllVersion = deserializeString(buffer.subarray(offset));
            offset += 4 + this._dllVersion.length + 1;
            this._hostname = deserializeString(buffer.subarray(offset));
            offset += 4 + this._hostname.length + 1;
            this._idAddress = deserializeString(buffer.subarray(offset));
            offset += 4 + this._idAddress.length + 1;
            buffer.copy(this._hashKey, 0, offset, offset + 16);
            return this;
        } catch (error) {
            const err = Error(`Error deserializing LoginInfoMessage: ${String(error)}`);
            err.cause = error;
            throw err;
        }
    }

    override serialize(): Buffer {
        try {
            const buffer = Buffer.alloc(this.header.messageLength);
            this.header.serialize().copy(buffer);
            let offset = LEGACY_HEADER_SIZE;
            buffer.writeUInt32BE(this._userId, offset);
            offset += 4;
            offset = serializeString(this._userName, buffer, offset);
            this._userData.copy(buffer, offset);
            offset += 64;
            buffer.writeUInt32BE(this._customerId, offset);
            offset += 4;
            buffer.writeUInt32BE(this._flags, offset);
            offset += 4;
            offset = serializeString(this._dllVersion, buffer, offset);
            offset = serializeString(this._hostname, buffer, offset);
            offset = serializeString(this._idAddress, buffer, offset);
            offset += 4 + this._idAddress.length + 1;
            this._hashKey.copy(buffer, offset);
            return buffer;
        } catch (error) {
            const err = Error(`Error serializing LoginInfoMessage: ${String(error)}`);
            err.cause = error;
            throw err;
        }
    }
}

function createErrorResponsePacket(responseCode: number): BytableMessage {
    const responsePacket = new BytableMessage();
    responsePacket.header.setMessageVersion(0);
    responsePacket.header.setId(responseCode);
    return responsePacket;
}

function portPacketToLegacyFormat(responsePacket: BytableMessage): BytableBuffer {
    const outboundMessage = new BytableBuffer();
    outboundMessage.deserialize(responsePacket.serialize());
    return outboundMessage;
}

function createLegacyErrorPacket(err: number, log: ServerLogger): BytableBuffer {
    const responsePacket = createErrorResponsePacket(err);
    log.verbose(`!!! outbound room login error packet: ${responsePacket.toString()}`);
    return portPacketToLegacyFormat(responsePacket);
}

function saveSessionKeyToConnection(
    keys: ConnectionRecord,
    connectionId: string,
    state: State,
): void {
    const newCommandEncryptionPair = createCommandEncryptionPair(keys.sessionKey);
    const newDataEncryptionPair = createDataEncryptionPair(keys.sessionKey);
    const newEncryption = new McosEncryption({
        connectionId,
        commandEncryptionPair: newCommandEncryptionPair,
        dataEncryptionPair: newDataEncryptionPair,
    });
    addEncryption(state, newEncryption).save();
}

export async function handleUserLogin({
    connectionId,
    message,
    log = getServerLogger('rooms.handleUserLogin'),
    sessionStore = databaseProvider.getSessionStore(),
}: RoomHandlerArgs & { sessionStore?: ISessionStore }): Promise<RoomHandlerResult> {
    const inboundMessage = new LoginInfoMessage();
    inboundMessage.deserialize(message.serialize());

    let userPersona;
    try {
        userPersona = await getPersonaByPersonaId({ personaId: inboundMessage._userId });
    } catch {
        return {
            connectionId,
            messages: [createLegacyErrorPacket(NPS_INVALID_KEY, log)],
        };
    }

    const { customerId } = userPersona;

    const existingEncryption = getEncryption(fetchStateFromDatabase(), connectionId);
    if (!existingEncryption) {
        let keys: ConnectionRecord | undefined;
        try {
            keys = await sessionStore.fetchSessionKeyByCustomerId(customerId);
        } catch (err) {
            log.warn(`Unable to fetch sessionkey`, { connectionId, customerId, err });
            return {
                connectionId,
                messages: [createLegacyErrorPacket(NPS_INVALID_KEY, log)],
            };
        }

        if (keys === undefined) {
            throw new Error('Error fetching session keys!');
        }

        try {
            saveSessionKeyToConnection(keys, connectionId, fetchStateFromDatabase());
        } catch (error) {
            const err = Error('Error creating encryption');
            err.cause = error;
            throw err;
        }
    }

    await sessionStore.updateConnection(connectionId, inboundMessage._userId);

    const responsePacket = new BytableMessage();
    responsePacket.header.setMessageVersion(0);
    responsePacket.header.setId(0x120);

    responsePacket.setSerializeOrder([
        { name: 'userId', field: 'Dword' },
        { name: 'userName', field: 'Container' },
        { name: 'userData', field: 'Buffer' },
    ]);

    responsePacket.setFieldValueByName('userId', inboundMessage._userId);
    responsePacket.setFieldValueByName('userName', inboundMessage._userName);
    responsePacket.setFieldValueByName('userData', inboundMessage._userData);

    const port = connectionId.split(':')[1];
    if (port === '10001') {
        responsePacket.header.setId(0x308);
    }

    log.verbose(`!!! outbound room login response packet: ${responsePacket.toString()}`);
    log.debug(`[${connectionId}] Returning with ${portPacketToLegacyFormat(responsePacket).toHexString()}`);

    return {
        connectionId,
        messages: [portPacketToLegacyFormat(responsePacket)],
    };
}
