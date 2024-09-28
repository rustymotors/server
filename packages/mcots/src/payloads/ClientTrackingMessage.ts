import { getServerLogger } from "rusty-motors-shared";
import { ServerMessagePayload } from "rusty-motors-shared-packets";

const log = getServerLogger({});

export class ClientTrackingMessage extends ServerMessagePayload {
	private _type: number = 0; // 2 bytes
	private _trackingText: string = ""; // 256 bytes

	constructor(size: number) {
		super();

		this._data = Buffer.alloc(size);
	}

	override getByteSize(): number {
		return 0;
	}

	override deserialize(data: Buffer): ClientTrackingMessage {
		try {
			this.messageId = data.readUInt16LE(0);

			this._type = data.readUInt16LE(2);

			this._trackingText = data.toString("utf8", 4, 260);

			return this;
		} catch (error) {
			log.error(
				`Error deserializing ClientTrackingMessage: ${error as string}`,
			);
			throw error;
		}
	}

	getType() {
		return this._type;
	}

	getTrackingText() {
		return this._trackingText;
	}
}
