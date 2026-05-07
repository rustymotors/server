export class BytablePad {
    constructor(private readonly size_: number) {}

    get serializeSize(): number { return this.size_; }
    serialize(): Buffer { return Buffer.alloc(this.size_, 0); }
    deserialize(_buf: Buffer): void {}
}
