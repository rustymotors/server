
export const MessageNumberMap: Record<number, string> = {
    0x0100: "NPS_LOGIN",
};

export type MessageName = keyof typeof MessageNumberMap;
