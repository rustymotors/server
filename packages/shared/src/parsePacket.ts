import { NPS_MESSAGE_IDS } from "./constants/NPSMessageIds.js";

export type PacketProtocol = "HTTP" | "NPS" | "Unknown";

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
 * A buffer is NPS when its big-endian u16 at offset 2 equals the buffer
 * length. The reference client's header is [u16 BE id][u16 BE length].
 */
export function parsePacket(input: string | Buffer): ParsedPacket {
    const payload = typeof input === "string" ? hexToBuffer(input) : input;

    if (/^(GET|POST|HEAD|PUT|DELETE|OPTIONS|PATCH|CONNECT|TRACE) /.test(payload.toString("ascii", 0, 8))) {
        return { protocol: "HTTP", payload };
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
    return lines;
}
