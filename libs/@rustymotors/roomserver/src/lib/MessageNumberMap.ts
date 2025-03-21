
export const MessageNumberMap: Record<number, string> = {
    0x0100: "NPS_LOGIN",
    0x0101: "NPS_GET_USER_LIST",
    0x0120: "NPS_LOGIN_RESPONSE",
    0x1101: "NPS_ENCRYPTED_COMMAND",
};

export type MessageNumber = keyof typeof MessageNumberMap;

export type MessageName = typeof MessageNumberMap[MessageNumber];

export function getMessageName(messageNumber: MessageNumber): string {
    const messageName = MessageNumberMap[messageNumber];
    if (!messageName) {
        throw new Error(`Unknown message number: ${messageNumber}`);
    }
    return messageName;
}

/**
 * Rturns the message number for the given message name
 * @param messageName 
 * @returns {number | undefined}
 */
export function getMessageNumber(messageName: MessageName): number {
    for (const [key, value] of Object.entries(MessageNumberMap)) {
        if (value === messageName) {
            return parseInt(key);
        }
    }
    throw new Error(`Unknown message name: ${messageName}`);
}
