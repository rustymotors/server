import { lessThan, greaterThan, lessThanOrEqual } from "./pureCompare.js";
import { getWord } from "./pureGet.js";

export function guessMessageType(bytes: Buffer, isLE: boolean): string {
    // Guess the message type based on the first 4 bytes

    // Get the input buffer length
    const bufferLength = bytes.length;

    // If the buffer is too short, throw an error
    if (lessThan(bufferLength, 4)) {
        throw new Error(
            `Buffer length ${bytes.length} is too short to guess message type`,
        );
    }

    // Get the first two words
    const firstWord = getWord(bytes, 0, isLE);
    const secondWord = getWord(bytes, 2, isLE);

    // Default to unknown
    let messageType = "Unknown";

    // If the first word is greater then the buffer length, and the second word is <= the buffer length, it's a server message
    if (
        greaterThan(secondWord, bufferLength) &&
        lessThanOrEqual(firstWord, bufferLength)
    ) {
        messageType = "Server";
    } else if (
        greaterThan(firstWord, bufferLength) &&
        lessThanOrEqual(secondWord, bufferLength)
    ) {
        messageType = "Game";
    }

    // Return the message type
    return messageType;
}
