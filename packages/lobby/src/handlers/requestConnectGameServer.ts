import { getPersonaByPersonaId } from 'rusty-motors-authentication';
import { LoginInfoMessage } from '../LoginInfoMessage.js';

import {
    createCommandEncryptionPair,
    createDataEncryptionPair,
} from 'rusty-motors-gateway';
import {
    type ConnectionRecord,
    McosEncryption,
    type ServerLogger,
    type ServiceArgs,
    type ServiceResponse,
    type State,
    addEncryption,
    fetchStateFromDatabase,
    getEncryption,
    databaseProvider,
    type ISessionStore,
} from 'rusty-motors-shared';
import { getServerLogger } from 'rusty-motors-shared';
import { BytableMessage, BytableBuffer } from '@rustymotors/binary';

const NPS_INVALID_KEY = 0x22a;

/**
 * Convert to zero padded hex
 *
 * @export
 * @param {Buffer} data
 * @return {string}
 */
export function toHex(data: Buffer): string {
    /** @type {string[]} */
    const bytes: string[] = [];
    data.forEach((b: number) => {
        bytes.push(b.toString(16).toUpperCase().padStart(2, '0'));
    });
    return bytes.join('');
}

class PacketProcessor {
    private connectionId: string;
    private message: BytableBuffer;
    private log: ServerLogger;
    private sessionStore: ISessionStore

    constructor({
        connectionId,
        message,
        log = getServerLogger('PacketProcessor'),
        sessionStore = databaseProvider.getSessionStore(),
    }: ServiceArgs & { sessionStore?: ISessionStore }) {
        this.connectionId = connectionId;
        this.message = message;
        this.log = log;
        this.sessionStore = sessionStore
    }

    async invoke() {
        // This is a NPS_LoginInfo packet
        // As a legacy packet, it used the old NPSMessage format
        // of a 4 byte header, followed by a 4 byte length, followed
        // by the data payload.

	const inboundMessage = new LoginInfoMessage();
	inboundMessage.deserialize(this.message.serialize());

        this.log.debug(
            `LoginInfoMessage: ${new LoginInfoMessage().toString()}`,
        );

        let userPersona;

    try {
        userPersona = await getPersonaByPersonaId({
            personaId: inboundMessage._userId,
        });
    } catch (error) {
        // TODO: parse error and return approprate code
		const outboundMessage = createLegacyErrorPacket(NPS_INVALID_KEY);

            return {
                connectionId: this.connectionId,
                messages: [outboundMessage],
            };
        }
        const { customerId } = userPersona;

        const existingEncryption = getEncryption(
            fetchStateFromDatabase(),
            this.connectionId,
        );

        if (!existingEncryption) {
            // Set the encryption keys on the lobby connection
            let keys;

            try {
                keys =
                    await this.sessionStore.fetchSessionKeyByCustomerId(
                        customerId,
                    );
            } catch (err) {
                this.log.warn(`Unable to fetch sessionkey`, {
                    connectionId: this.connectionId,
                    customerId,
                    err,
                });
                // TODO: parse error and return approprate code

            const outboundMessage = createLegacyErrorPacket(NPS_INVALID_KEY);
                return {
                connectionId: this.connectionId,
                messages: [outboundMessage],
                };
            }

            if (keys === undefined) {
                throw Error('Error fetching session keys!');
            }

            // We have the session keys, set them on the connection
            try {
                saveSessionKeyToConnection(
                    keys,
                    this.connectionId,
                    fetchStateFromDatabase(),
                );
            } catch (error) {
                const err = Error(`Error creating encryption`);
                err.cause = error;
                // 20a
                throw err;
            }
        }

        // We have a session, we are good to go!
        await this.sessionStore.updateConnection(
            this.connectionId,
            new LoginInfoMessage()._userId,
        );

        // Send the response packet

        const responsePackets = [];

    const responsePacket = createGameServerResponsePacket(inboundMessage);

        // log the packet
        this.log.verbose(
            `!!! outbound lobby login response packet: ${responsePacket.toString()}`,
        );

        const outboundMessage = portPacketToLegacyFormat(responsePacket);

        responsePackets.push(outboundMessage);

        this.log.debug(
            `[${this.connectionId}] Returning with ${outboundMessage.toHexString()}`,
        );

        return {
            connectionId: this.connectionId,
            messages: responsePackets,
        };
    }
}

/**
 * Handle a request to connect to a game server packet
 *
 * @private
 * @param {ServiceArgs} args
 * @returns {Promise<{
 *  connectionId: string,
 * messages: BytableBuffer[],
 * }>}
 */
export async function _npsRequestGameConnectServer({
    connectionId,
    message,
    log = getServerLogger('handlers/_npsRequestGameConnectServer'),
    sessionStore = databaseProvider.getSessionStore()
}: ServiceArgs & { sessionStore?: ISessionStore}): Promise<ServiceResponse> {
    const packetProcessor = new PacketProcessor({ connectionId, message, log, sessionStore });
    return await packetProcessor.invoke();
}

function createLegacyErrorPacket(
    err: number,
    log: ServerLogger = getServerLogger(`createLegacyErrorPacket: ${err}`),
) {
    const responsePacket = createErrorResponsePacket(err);

    // log the packet
    log.verbose(
        `!!! outbound lobby login response packet: ${responsePacket.toString()}`,
    );

    const outboundMessage = portPacketToLegacyFormat(responsePacket);
    return outboundMessage;
}

function createErrorResponsePacket(responseCode: number) {
    const responsePacket = new BytableMessage();
    responsePacket.header.setMessageVersion(0);
    responsePacket.header.setId(responseCode); // invalid key
    return responsePacket;
}

function createGameServerResponsePacket(inboundMessage: LoginInfoMessage) {
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
    return responsePacket;
}

function portPacketToLegacyFormat(responsePacket: BytableMessage) {
    const outboundMessage = new BytableBuffer();
    outboundMessage.deserialize(responsePacket.serialize());
    return outboundMessage;
}

function saveSessionKeyToConnection(
    keys: ConnectionRecord,
    connectionId: string,
    state: State,
) {
    const newCommandEncryptionPair = createCommandEncryptionPair(
        keys.sessionKey,
    );

    const newDataEncryptionPair = createDataEncryptionPair(keys.sessionKey);

    const newEncryption = new McosEncryption({
        connectionId,
        commandEncryptionPair: newCommandEncryptionPair,
        dataEncryptionPair: newDataEncryptionPair,
    });

    addEncryption(state, newEncryption).save();
}
