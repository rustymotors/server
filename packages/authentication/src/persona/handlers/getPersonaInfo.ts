import {
    LegacyMessage,
    NPSMessage,
    type ServerLogger,
} from 'rusty-motors-shared';
import { BytableBuffer } from '@rustymotors/binary';
import { createGameProfile } from 'rusty-motors-nps';
import { getPersonaByPersonaId } from '../getPersonasByPersonaId.js';
import { personaToString } from '../internal.js';
import * as Sentry from '@sentry/node';

import { getServerLogger } from 'rusty-motors-shared';

const defaultLogger = getServerLogger('PersonaServer');

export async function getPersonaInfo({
    connectionId,
    message,
    log = defaultLogger,
}: {
    connectionId: string;
    message: LegacyMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: BytableBuffer[];
}> {
    log.debug('getPersonaInfo...');
    const requestPacket = new NPSMessage();
    requestPacket._doDeserialize(message.serialize());

    log.debug(
        `LegacyMsg request object from getPersonaInfo ${requestPacket.toString()}`,
    );

    const outboundMessage = new BytableBuffer();

    const responsePacket = new LegacyMessage();
    const personaId = requestPacket.data.readUInt32BE(0);

    log.debug(`personaId: ${personaId}`);

    try {
        await getPersonaByPersonaId({
            personaId,
        }).then((persona) => {
            log.debug(`Persona found: ${personaToString(persona)}`);

            const profile = createGameProfile();

            profile.customerId = persona.customerId;
            profile.profileId = persona.personaId;
            profile.profileName = persona.personaName;

            // Build the packet
            // Response Code
            // 0x607 = Game Persona Info
            const responsePacket = new LegacyMessage();
            responsePacket._header.id = 0x607;
            responsePacket.setBuffer(profile.serialize());
            log.debug(
                `LegacyMsg response object from getPersonaInfo ${responsePacket
                    ._doSerialize()
                    .toString('hex')} `,
            );

            const outboundMessage = new BytableBuffer();
            outboundMessage.setValue(responsePacket._doSerialize());
            return outboundMessage;
        });
    } catch (error) {
        log.error(`Error fetching persions for ${personaId}`);
        Sentry.captureException(error);
        responsePacket._header.id = 0x612; // no persona
        outboundMessage.setValue(responsePacket._doSerialize());
    }

    return {
        connectionId,
        messages: [outboundMessage],
    };
}
