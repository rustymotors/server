
export const MessageNumberMap: Record<number, string> = {
    0x0100: "NPS_LOGIN",
    0x0101: "NPS_GET_USER_LIST",
};

export type MessageName = keyof typeof MessageNumberMap;
