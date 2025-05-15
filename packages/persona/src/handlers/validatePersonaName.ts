import { SerializedBufferOld } from 'rusty-motors-shared';
import { LegacyMessage } from 'rusty-motors-shared';
import { RawMessage } from 'rusty-motors-shared';
import { getServerLogger, ServerLogger } from 'rusty-motors-logger';

const defaultLogger = getServerLogger('PersonaServer');

/**
 * Constructs a response indicating whether a requested persona name is valid.
 *
 * Always responds with a duplicate user code, regardless of input.
 *
 * @param connectionId - The identifier for the client connection.
 * @param message - The incoming legacy message containing the persona name request.
 * @returns An object containing the {@link connectionId} and an array with a single serialized response message.
 *
 * @remark This function currently does not perform actual validation and always returns a duplicate user response.
 */

export async function validatePersonaName({
    connectionId,
    message,
    log = defaultLogger,
}: {
    connectionId: string;
    message: LegacyMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: SerializedBufferOld[];
}> {
    log.debug('validatePersonaName called');
    const requestPacket = message;
    log.debug(
        `NPSMsg request object from validatePersonaName ${requestPacket.toString()}`,
    );

    enum responseCodes {
        NPS_DUP_USER = 0x20a,
        NPS_USER_VALID = 0x601,
    }

    // Build the packet
    const responsePacket = new RawMessage(responseCodes.NPS_DUP_USER);
    log.debug(
        `NPSMsg response object from validatePersonaName
      ${JSON.stringify({
          NPSMsg: responsePacket.toString(),
      })}`,
    );

    const outboundMessage = new SerializedBufferOld();
    outboundMessage._doDeserialize(responsePacket.serialize());

    return {
        connectionId,
        messages: [outboundMessage],
    };
}
