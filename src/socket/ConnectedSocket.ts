import { randomUUID } from "node:crypto";
import EventEmitter from "node:events";

/**
 * Represents a connected socket with various properties and methods for reading and writing data.
 */
export type ConnectedSocket = {
	/**
	 * The unique identifier of the connected socket.
	 */
	id: string;
	/**
	 * The length of the data array.
	 */
	length: number;

	/**
	 * The local port of the connected socket.
	 */
	port: number;

	/**
	 * Indicates whether there is any data available.
	 */
	hasData: boolean;
	/**
	 * Sets the data by concatenating the existing data with the new data.
	 */
	data: Buffer;
	/**
	 * Reads a specified number of bytes from the data buffer.
	 * If the requested length exceeds the available data, it reads only the available data.
	 * @param length - The number of bytes to read from the buffer.
	 */
	read(length?: number): Buffer;
	/**
	 * Emits the provided data buffer as a "data" event.
	 * @param data - The buffer containing the data to be emitted.
	 */
	write(data: Buffer): void;

	/**
	 * Reads a specified number of bytes from the data buffer without removing them.
	 * @param length  - The number of bytes to peek from the buffer. If not provided, peeks all available data.
	 */
	peek(length?: number): Buffer;
	/**
	 * Adds a one-time listener function for the specified event.
	 * @param event  - The event to listen for.
	 * @param listener  - The callback function to be executed when the event is emitted.
	 */
	on(event: "inData", listener: (data: Buffer) => void): void;
	on(event: "outData", listener: (data: Buffer) => void): void;
	on(event: "error", listener: (error: Error) => void): void;
};

export class ConnectedSocket_ extends EventEmitter implements ConnectedSocket {
	readonly id: string;
	readonly port: number;

	private _data: Buffer = Buffer.alloc(0);

	constructor(port: number) {
		super();
		this.id = randomUUID();
		this.port = port;
	}

	/**
	 * Gets the length of the data array.
	 *
	 * @returns {number} The length of the data array.
	 */
	get length(): number {
		return this._data.length;
	}

	/**
	 * Checks if there is any data available.
	 *
	 * @returns {boolean} `true` if there is data, otherwise `false`.
	 */
	get hasData(): boolean {
		return this._data.length > 0;
	}

	/**
	 * Sets the data by concatenating the existing data with the new data.
	 *
	 * @param data - The new data to be concatenated with the existing data.
	 */
	set data(data: Buffer) {
		this._data = Buffer.concat([this._data, data]);
		this.emit("inData", data);
	}

	/**
	 * Reads a specified number of bytes from the data buffer.
	 * If the requested length exceeds the available data, it reads only the available data.
	 *
	 * @param [length] - The number of bytes to read from the buffer. If not provided, reads all available data.
	 * @returns A Buffer containing the read bytes.
	 */
	read(length = this._data.length): Buffer {
		if (this._data.length < length) {
			length = this._data.length;
		}
		const result = this._data.subarray(0, length);
		this._data = this._data.subarray(length);
		return result;
	}

	/**
	 * Emits the provided data buffer as a "data" event.
	 *
	 * @param data - The buffer containing the data to be emitted.
	 */
	write(data: Buffer): void {
		this.emit("outData", data);
	}

	/**
	 * Reads a specified number of bytes from the data buffer without removing them.
	 *
	 * @param [length] - The number of bytes to peek from the buffer. If not provided, peeks all available data.
	 * @returns A Buffer containing the peeked bytes.
	 */
	peek(length = this._data.length): Buffer {
		if (this._data.length < length) {
			length = this._data.length;
		}
		const peekedBuffer = Buffer.alloc(length);
		this._data.copy(peekedBuffer, 0, 0, length);
		return peekedBuffer;
	}
}
