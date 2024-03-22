export type TokenRecord = {
    customerId: number;
    token: string;
};
export declare const activeTokens: Map<string, TokenRecord>;
export declare function generateTokenRecord(customerId: number): TokenRecord;
export declare function generateToken(customerId: number): string;
export declare function isTokenExpired(token: string): boolean;
export declare function getToken(token: string): TokenRecord | undefined;
export declare function deleteToken(token: string): void;
export declare function deleteExpiredTokens(): void;
export declare function getCustomerId(token: string): number | undefined;
