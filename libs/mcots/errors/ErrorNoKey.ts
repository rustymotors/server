export class ErrorNoKey extends Error {
    constructor(msg?: string) {
        super(msg || "No key provided");
    }
}
