export type LobbyCiphers = {
    cipher: import("crypto").Cipher | undefined;
    decipher: import("crypto").Decipher | undefined;
};
export type EConnectionStatus = string;
export namespace EConnectionStatus {
    const ACTIVE: string;
    const INACTIVE: string;
}
