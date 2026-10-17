import { BytableMessage } from '@rustymotors/binary';

/**
 * Build an NPS reply: [id: 2 bytes BE][total length: 2 bytes BE][data].
 * The header-only (version 0) layout, so the length counts the 4 header bytes.
 */
export function createNpsReply(id: number, data: Buffer): BytableMessage {
    const reply = new BytableMessage(0);
    reply.header.setId(id);
    reply.setFieldValueByName('data', data);
    return reply;
}
