import { NPS_MESSAGE_IDS } from "./constants/NPSMessageIds.js";

export type PacketProtocol = "HTTP" | "NPS" | "MCOTS" | "Unknown";

export interface ParsedPacket {
    protocol: PacketProtocol;
    payload: Buffer;
    /** Present when `protocol` is "NPS". */
    nps?: {
        messageId: number;
        /** Every NPS_MESSAGE_IDS name with this value (some ids are shared). */
        names: string[];
        /** The length field from the header (it includes the 4-byte header). */
        length: number;
        body: Buffer;
    };
    /** Present when `protocol` is "MCOTS". */
    mcots?: {
        /** The little-endian u16 at offset 0; it does not count its own 2 bytes. */
        length: number;
        /** True when `length + 2` equals the buffer; false when it holds a partial or several messages. */
        complete: boolean;
    };
}

/**
 * Decode a hex string into bytes. Accepts whitespace, ":" separators and a
 * leading "0x".
 *
 * @throws Error if the text is empty, has an odd number of digits, or contains a non-hex character
 */
export function hexToBuffer(text: string): Buffer {
    const hex = text.replace(/[\s:]/g, "").replace(/^0x/i, "");
    if (hex.length === 0) {
        throw new Error("No hex digits to parse");
    }
    if (!/^[0-9a-fA-F]*$/.test(hex)) {
        throw new Error("Input contains a character that is not a hex digit");
    }
    if (hex.length % 2 !== 0) {
        throw new Error(`Odd number of hex digits (${hex.length})`);
    }
    return Buffer.from(hex, "hex");
}

/**
 * Identify a payload as HTTP, NPS or unknown, and for NPS read the header.
 *
 * - HTTP: starts with a request method or "HTTP/1.x".
 * - NPS: the big-endian u16 at offset 2 equals the buffer length
 *   (header is [u16 BE id][u16 BE length]).
 * - MCOTS: the ASCII bytes "TOMC" at offset 2, after a little-endian u16
 *   length. A recorded buffer can hold more than one message, so a length
 *   that does not match is reported, not rejected.
 */
export function parsePacket(input: string | Buffer): ParsedPacket {
    const payload = typeof input === "string" ? hexToBuffer(input) : input;

    if (/^(GET|POST|HEAD|PUT|DELETE|OPTIONS|PATCH|CONNECT|TRACE) |^HTTP\/1\.[01] /.test(payload.toString("ascii", 0, 9))) {
        return { protocol: "HTTP", payload };
    }

    if (payload.length >= 6 && payload.toString("ascii", 2, 6) === "TOMC") {
        const length = payload.readUInt16LE(0);
        return { protocol: "MCOTS", payload, mcots: { length, complete: length + 2 === payload.length } };
    }

    if (payload.length >= 4 && payload.readUInt16BE(2) === payload.length) {
        const messageId = payload.readUInt16BE(0);
        const names = Object.entries(NPS_MESSAGE_IDS)
            .filter(([, value]) => value === messageId)
            .map(([name]) => name);
        return {
            protocol: "NPS",
            payload,
            nps: { messageId, names, length: payload.readUInt16BE(2), body: payload.subarray(4) },
        };
    }

    return { protocol: "Unknown", payload };
}

/** Render a parsed packet as the lines the CLI prints. */
export function formatParsedPacket(parsed: ParsedPacket): string[] {
    const lines = [
        `Detected protocol: ${parsed.protocol}`,
        `Payload (${parsed.payload.length} bytes, hex): ${parsed.payload.toString("hex")}`,
        `Payload (ascii): ${parsed.payload.toString("latin1").replace(/[^\x20-\x7e]/g, ".")}`,
    ];
    if (parsed.nps) {
        const { messageId, names, length, body } = parsed.nps;
        lines.push(
            `NPS message id: 0x${messageId.toString(16).padStart(4, "0")} (${messageId}) ${names.length > 0 ? names.join(" / ") : "not in NPS_MESSAGE_IDS"}`,
            `NPS length field: ${length}`,
            `NPS body (${body.length} bytes, hex): ${body.toString("hex")}`,
        );
    }
    if (parsed.mcots) {
        const { length, complete } = parsed.mcots;
        lines.push(
            `MCOTS length field: ${length} (${complete ? "matches the buffer" : `buffer is ${parsed.payload.length} bytes, so it holds a partial or several messages`})`,
        );
    }
    return lines;
}
