const MCOTS_HEADER_SIZE = 11;

export class PurchaseStockCarMessage {
    dealerId = 0;
    brandedPardId = 0;
    skinId = 0;
    tradeInCarId = 0;

    deserialize(data: Buffer): this {
        // Skip 11-byte MCOTS header; payload layout: msgNo(2LE) dealerId(4LE) brandedPardId(4LE) skinId(4LE) tradeInCarId(4LE)
        const payload = data.subarray(MCOTS_HEADER_SIZE);
        if (payload.length < 18) {
            throw new RangeError(
                `PurchaseStockCarMessage payload too short: got ${payload.length}, need 18`,
            );
        }
        // payload[0-1] = msgNo (skipped)
        this.dealerId = payload.readUInt32LE(2);
        this.brandedPardId = payload.readUInt32LE(6);
        this.skinId = payload.readUInt32LE(10);
        this.tradeInCarId = payload.readUInt32LE(14);
        return this;
    }

    toString() {
        return `PurchaseStockCarMessage: ${this.dealerId}, ${this.brandedPardId}, ${this.skinId}, ${this.tradeInCarId}`;
    }
}
