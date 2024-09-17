
/**
 * @param {Buffer} buffer
 * @returns {string}
 */

export function deserializeString(buffer: Buffer): string {
    try {
        const stringLength = buffer.readInt32BE(0);
        const stringBuffer = buffer.subarray(4, 4 + (stringLength - 1));

        const string = stringBuffer.toString("utf8").trim();
        return string;
    } catch (error) {
        const err = Error(
            `Error deserializing string from buffer ${buffer.toString("hex")}`,
        );
        err.cause = error;
        throw err;
    }
}
