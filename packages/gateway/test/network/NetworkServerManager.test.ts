import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { type ServerLogger, getServerLogger } from "rusty-motors-shared";
import { Server, type Socket as TcpSocket, createConnection } from "node:net";
import { Socket as UdpSocket, createSocket, type RemoteInfo } from "node:dgram";
import { NetworkServerManager } from "../../src/network/NetworkServerManager.js";

/**
 * Tests for NetworkServerManager functionality
 * 
 * These tests cover the TCP/UDP server management extracted from GatewayServer.
 */
describe("NetworkServerManager", () => {
	let networkManager: NetworkServerManager;
	let mockLogger: ServerLogger;
	let availablePorts: number[];

	beforeEach(() => {
		mockLogger = {
			debug: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
		} as unknown as ServerLogger;

		networkManager = new NetworkServerManager(mockLogger, 0);

		// Generate available ports for testing
		availablePorts = [];
		for (let i = 0; i < 10; i++) {
			availablePorts.push(30000 + i);
		}
	});

	afterEach(async () => {
		// Clean up all servers
		await networkManager.shutdownAll();
	});

	describe("TCP Server Management", () => {
		it("should start a TCP server on a specified port", async () => {
			const port = availablePorts[0];
			let connectionReceived = false;

			const server = await networkManager.startTcpServer(port, ({ incomingSocket }) => {
				connectionReceived = true;
				incomingSocket.end();
			});

			expect(server.listening).toBe(true);
			expect(mockLogger.debug).toHaveBeenCalledWith(`TCP server listening on port ${port}`);

			// Test that we can connect to it
			const client = createConnection({ port, host: "127.0.0.1" });
			await new Promise<void>((resolve) => {
				client.on("connect", () => {
					client.end();
					resolve();
				});
				client.on("error", resolve);
			});

			// Give handler time to be called
			await new Promise((resolve) => setTimeout(resolve, 50));
			expect(connectionReceived).toBe(true);
		});

		it("should handle TCP server connection handler", async () => {
			const port = availablePorts[1];
			let handlerCalled = false;
			let receivedSocket: TcpSocket | null = null;

			const connectionHandler = ({ incomingSocket }: { incomingSocket: TcpSocket }) => {
				handlerCalled = true;
				receivedSocket = incomingSocket;
				incomingSocket.end();
			};

			await networkManager.startTcpServer(port, connectionHandler);

			// Connect to trigger the handler
			const client = createConnection({ port, host: "127.0.0.1" });
			await new Promise<void>((resolve) => {
				client.on("connect", () => {
					client.end();
					resolve();
				});
				client.on("error", resolve);
			});

			// Give handler time to be called
			await new Promise((resolve) => setTimeout(resolve, 50));

			expect(handlerCalled).toBe(true);
			expect(receivedSocket).not.toBeNull();
		});

		it("should reject when port is already in use", async () => {
			const port = availablePorts[2];

			// Start first server
			await networkManager.startTcpServer(port, ({ incomingSocket }) => {
				incomingSocket.end();
			});

			// Try to start second server on same port
			await expect(
				networkManager.startTcpServer(port, ({ incomingSocket }) => {
					incomingSocket.end();
				})
			).rejects.toThrow(`TCP server already running on port ${port}`);
		});

		it("should track multiple TCP servers", async () => {
			const ports = [availablePorts[3], availablePorts[4]];

			for (const port of ports) {
				await networkManager.startTcpServer(port, ({ incomingSocket }) => {
					incomingSocket.end();
				});
			}

			const activeServers = networkManager.getActiveServers();
			const tcpServers = activeServers.filter(s => s.type === 'tcp');
			expect(tcpServers).toHaveLength(2);
			expect(tcpServers[0].port).toBe(ports[0]);
			expect(tcpServers[1].port).toBe(ports[1]);
		});
	});

	describe("UDP Socket Management", () => {
		it("should bind a UDP socket to a specified port", async () => {
			const port = availablePorts[5];

			const socket = await networkManager.startUdpServer(port, () => {});

			expect(socket).not.toBeNull();
			const address = socket.address();
			expect(address.port).toBe(port);
			expect(mockLogger.debug).toHaveBeenCalledWith(`UDP socket bound to port ${port}`);
		});

		it("should handle UDP message handler", async () => {
			const port = availablePorts[6];
			let handlerCalled = false;
			let receivedMessage: Buffer | null = null;
			let receivedRemoteInfo: RemoteInfo | null = null;

			const messageHandler = (
				message: Buffer,
				rinfo: RemoteInfo,
			) => {
				handlerCalled = true;
				receivedMessage = message;
				receivedRemoteInfo = rinfo;
			};

			await networkManager.startUdpServer(port, messageHandler);

			// Send a test message
			const testMessage = Buffer.from("test message");
			const clientSocket = createSocket("udp4");
			clientSocket.send(testMessage, port, "127.0.0.1", () => {
				clientSocket.close();
			});

			// Wait for message to be received
			await new Promise((resolve) => setTimeout(resolve, 100));

			expect(handlerCalled).toBe(true);
			expect(receivedMessage).not.toBeNull();
			expect(receivedRemoteInfo).not.toBeNull();
		});

		it("should reject when UDP port is already in use", async () => {
			const port = availablePorts[7];

			// Bind first socket
			await networkManager.startUdpServer(port, () => {});

			// Try to bind second socket on same port
			await expect(
				networkManager.startUdpServer(port, () => {})
			).rejects.toThrow(`UDP socket already bound to port ${port}`);
		});

		it("should track multiple UDP sockets", async () => {
			const ports = [availablePorts[8], availablePorts[9]];

			for (const port of ports) {
				await networkManager.startUdpServer(port, () => {});
			}

			const activeServers = networkManager.getActiveServers();
			const udpServers = activeServers.filter(s => s.type === 'udp');
			expect(udpServers).toHaveLength(2);
			expect(udpServers[0].port).toBe(ports[0]);
			expect(udpServers[1].port).toBe(ports[1]);
		});
	});

	describe("Server Shutdown", () => {
		it("should close all TCP servers", async () => {
			const ports = [availablePorts[0], availablePorts[1]];

			for (const port of ports) {
				await networkManager.startTcpServer(port, ({ incomingSocket }) => {
					incomingSocket.end();
				});
			}

			const activeServersBefore = networkManager.getActiveServers();
			expect(activeServersBefore.filter(s => s.type === 'tcp')).toHaveLength(2);

			await networkManager.shutdownAll();

			const activeServersAfter = networkManager.getActiveServers();
			expect(activeServersAfter).toHaveLength(0);
			expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining("TCP server on port"));
		});

		it("should close all UDP sockets", async () => {
			const ports = [availablePorts[2], availablePorts[3]];

			for (const port of ports) {
				await networkManager.startUdpServer(port, () => {});
			}

			const activeServersBefore = networkManager.getActiveServers();
			expect(activeServersBefore.filter(s => s.type === 'udp')).toHaveLength(2);

			await networkManager.shutdownAll();

			const activeServersAfter = networkManager.getActiveServers();
			expect(activeServersAfter).toHaveLength(0);
			expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining("UDP socket on port"));
		});

		it("should handle shutdown when no servers are running", async () => {
			// This should not throw an error
			await networkManager.shutdownAll();

			const activeServers = networkManager.getActiveServers();
			expect(activeServers).toHaveLength(0);
		});
	});

	describe("Backlog Configuration", () => {
		it("should use backlogAllowedCount when starting TCP server", async () => {
			const port = availablePorts[4];
			const backlogCount = 10;
			const managerWithBacklog = new NetworkServerManager(mockLogger, backlogCount);

			// Note: backlog is passed to listen() but we can't easily test its effect
			// without multiple connections. We just verify it doesn't throw.
			const server = await managerWithBacklog.startTcpServer(port, ({ incomingSocket }) => {
				incomingSocket.end();
			});

			expect(server.listening).toBe(true);

			await managerWithBacklog.shutdownAll();
		});
	});

	describe("Error Handling", () => {
		it("should handle TCP server errors gracefully", async () => {
			const port = availablePorts[5];

			const server = await networkManager.startTcpServer(port, ({ incomingSocket }) => {
				incomingSocket.end();
			});

			// Simulate an error by emitting an error event
			// (In real usage, errors would come from network issues, etc.)
			server.emit("error", new Error("Test error"));

			await new Promise((resolve) => setTimeout(resolve, 50));

			expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining("TCP server error on port"));
		});

		it("should handle UDP socket errors gracefully", async () => {
			const port = availablePorts[6];

			const socket = await networkManager.startUdpServer(port, () => {});

			// Simulate an error
			socket.emit("error", new Error("Test UDP error"));

			await new Promise((resolve) => setTimeout(resolve, 50));

			expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining("UDP socket error on port"));
		});
	});
});
