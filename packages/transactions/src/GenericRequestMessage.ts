// WORD  msgNo;    // typically MC_SUCCESS or MC_FAILURE
// DWORD data;   // specific to the message sent (but usually 0)
// DWORD data2;

export class GenericRequestMessage {
	msgNo: number;
	data: Buffer;
	data2: Buffer;

	constructor() {
		this.msgNo = 0; // 2 bytes
		this.data = Buffer.alloc(4); // 4 bytes
		this.data2 = Buffer.alloc(4); // 4 bytes
	}

	deserialize(buffer: Buffer) {
		try {
			this.msgNo = buffer.readUInt16LE(0);
		} catch (error) {
			if (error instanceof RangeError) {
				// This is likeley not an MCOTS packet, ignore
			} else {
				const err = new TypeError(
					`[GenericRequestMsg] Unable to read msgNo from ${buffer.toString(
						"hex",
					)}: ${String(error)}`,
				);
				throw err;
			}
		}

		this.data = buffer.subarray(2, 6);
		this.data2 = buffer.subarray(6);
	}

	serialize(): Buffer {
		const packet = Buffer.alloc(16);
		packet.writeUInt16LE(this.msgNo, 0);
		this.data.copy(packet, 2);
		this.data2.copy(packet, 6);
		return packet;
	}

	toString() {
		return `GenericRequest ${JSON.stringify({
			msgNo: this.msgNo,
			data: this.data.toString("hex"),
			data2: this.data2.toString("hex"),
		})}`;
	}
}
