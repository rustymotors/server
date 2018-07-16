declare class OldSSLCiphers {
    ciphers: string;
    minimumTLSVersion: number;
    private cipherSuites;
    constructor();
}
declare const SSLConfig: OldSSLCiphers;
export { SSLConfig };
