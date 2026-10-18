#!/usr/bin/env -S npx tsx
// Parse a hex-encoded payload: detect the protocol and, for NPS, read the header.
// usage: npm run parse-packet -- <hex>
import { formatParsedPacket, parsePacket } from "../packages/shared/src/parsePacket.js";

const hex = process.argv.slice(2).join(" ");

if (hex.trim() === "") {
    console.error("usage: npm run parse-packet -- <hex bytes>");
    process.exit(2);
}

try {
    console.log(formatParsedPacket(parsePacket(hex)).join("\n"));
} catch (error) {
    console.error(`Failed to parse payload: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
}
