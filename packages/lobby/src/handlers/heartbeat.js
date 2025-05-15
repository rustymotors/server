import { getServerLogger } from 'rusty-motors-logger';
import { NPSMessage, SerializedBuffer } from 'rusty-motors-shared';

/**
 * Constructs and serializes a heartbeat NPS message for a given connection.
 *
 * Prepares an NPS message with a specific header ID and an 8-byte buffer, serializes it, and returns it in an array for outbound transmission.
 *
 * @param {Object} params - The parameters for the heartbeat handler.
 * @param {string} params.connectionId - The identifier for the connection to which the heartbeat is sent.
 * @returns {{connectionId: string, messages: SerializedBuffer[]}} An object containing the connection ID and an array with the serialized heartbeat message.
 */
export async function _npsHeartbeat({
    connectionId,
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    message,
    log = getServerLogger({
        name: '_npsHeartbeat',
    }),
}) {
    const packetContent = Buffer.alloc(8);
    const packetResult = new NPSMessage();
    packetResult._header.id = 0x127;
    packetResult.setBuffer(packetContent);

    log.debug('Dumping packet...');
    log.debug(packetResult.toString());

    const outboundMessage = new SerializedBuffer();
    outboundMessage.deserialize(packetResult.serialize());

    return {
        connectionId,
        messages: [outboundMessage],
    };
}
