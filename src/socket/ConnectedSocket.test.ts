import { describe, it, expect, vi } from "vitest";
import { Buffer } from "node:buffer";
import {ConnectedSocket_, type ConnectedSocket} from "./ConnectedSocket.js";

describe("ConnectedSocket_", () => {
	it("should generate a unique id on creation", () => {
		const socket = new ConnectedSocket_();
		expect(socket.id).toBeDefined();
		expect(typeof socket.id).toBe("string");
	});

	it("should have initial length of 0", () => {
		const socket = new ConnectedSocket_();
		expect(socket.length).toBe(0);
	});

	it("should initially have no data", () => {
		const socket = new ConnectedSocket_();
		expect(socket.hasData).toBe(false);
	});

	it("should set and concatenate data correctly", () => {
		const socket = new ConnectedSocket_() as ConnectedSocket;
		const data1 = Buffer.from("Hello");
		const data2 = Buffer.from("World");

		socket.data = data1;
		expect(socket.length).toBe(data1.length);
		expect(socket.hasData).toBe(true);

		socket.data = data2;
		expect(socket.length).toBe(data1.length + data2.length);
		expect(socket.read().toString()).toBe("HelloWorld");
	});

	it("should read the correct amount of data", () => {
		const socket = new ConnectedSocket_();
		const data = Buffer.from("HelloWorld");
        socket.data = data;

        expect(socket.read(5).toString()).toBe("Hello");
        expect(socket.read(5).toString()).toBe("World");
        expect(socket.read(5).toString()).toBe("");
	});

	it("should emit data event on write", () => {
		const socket = new ConnectedSocket_();
		const data = Buffer.from("HelloWorld");
		const listener = vi.fn();

		socket.on("data", listener);
		socket.write(data);

		expect(listener).toHaveBeenCalledWith(data);
	});
});
