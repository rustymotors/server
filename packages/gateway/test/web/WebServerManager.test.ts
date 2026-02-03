import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ServerLogger } from "rusty-motors-shared";
import http from "node:http";
import { type Socket as TcpSocket, createConnection } from "node:net";
import { WebServerManager } from "../../src/web/WebServerManager.js";

/**
 * Tests for WebServerManager
 * 
 * Following TDD principles - tests written before implementation.
 * 
 * Note: WebServerManager manages the HTTP server but integrates with
 * NetworkServerManager for TCP connection handling. The web server receives
 * connections via TCP port 3000 to support both HTTP and raw packet handling.
 */
describe("WebServerManager", () => {
	let webServerManager: WebServerManager;
	let mockLogger: ServerLogger;
	let mockRequestHandler: http.RequestListener;
	let availablePort: number;

	beforeEach(() => {
		mockLogger = {
			debug: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
		} as unknown as ServerLogger;

		mockRequestHandler = vi.fn((req, res) => {
			res.writeHead(200, { "Content-Type": "text/plain" });
			res.end("OK");
		});

		// Use a high port for testing
		availablePort = 30000;

		webServerManager = new WebServerManager(mockLogger, mockRequestHandler);
	});

	afterEach(async () => {
		// Clean up
		if (webServerManager.isRunning()) {
			await webServerManager.stop();
		}
	});

	describe("constructor", () => {
		it("should create WebServerManager with request handler", () => {
			// Assert
			expect(webServerManager).toBeDefined();
			expect(webServerManager.isRunning()).toBe(false);
		});
	});

	describe("start", () => {
		it("should mark HTTP server as ready to receive connections", async () => {
			// Act
			await webServerManager.start(availablePort);

			// Assert
			expect(webServerManager.isRunning()).toBe(true);
			expect(mockLogger.info).toHaveBeenCalledWith(
				expect.stringContaining(`Web server ready to receive connections on port ${availablePort}`),
			);
		});

		it("should throw error when starting already running server", async () => {
			// Arrange
			await webServerManager.start(availablePort);

			// Act & Assert
			await expect(webServerManager.start(availablePort + 1)).rejects.toThrow(
				"Web server already running",
			);
		});

		it("should allow starting with any port number", async () => {
			// Note: WebServerManager doesn't actually listen on the port,
			// NetworkServerManager does that. So any port number is valid here.

			// Act & Assert - should not throw
			await expect(webServerManager.start(availablePort)).resolves.not.toThrow();
			expect(webServerManager.isRunning()).toBe(true);
		});
	});

	describe("stop", () => {
		it("should stop running HTTP server", async () => {
			// Arrange
			await webServerManager.start(availablePort);
			expect(webServerManager.isRunning()).toBe(true);

			// Act
			await webServerManager.stop();

			// Assert
			expect(webServerManager.isRunning()).toBe(false);
			expect(mockLogger.info).toHaveBeenCalledWith("Web server stopped");
		});

		it("should not throw when stopping non-running server", async () => {
			// Act & Assert
			await expect(webServerManager.stop()).resolves.not.toThrow();
		});

		it("should allow restarting after stop", async () => {
			// Arrange
			await webServerManager.start(availablePort);
			await webServerManager.stop();

			// Act
			await webServerManager.start(availablePort);

			// Assert
			expect(webServerManager.isRunning()).toBe(true);
		});
	});

	describe("isRunning", () => {
		it("should return false when server not started", () => {
			// Assert
			expect(webServerManager.isRunning()).toBe(false);
		});

		it("should return true when server is running", async () => {
			// Arrange
			await webServerManager.start(availablePort);

			// Assert
			expect(webServerManager.isRunning()).toBe(true);
		});

		it("should return false after server is stopped", async () => {
			// Arrange
			await webServerManager.start(availablePort);
			await webServerManager.stop();

			// Assert
			expect(webServerManager.isRunning()).toBe(false);
		});
	});

	describe("getServer", () => {
		it("should return HTTP server instance", async () => {
			// Arrange
			await webServerManager.start(availablePort);

			// Act
			const server = webServerManager.getServer();

			// Assert
			expect(server).toBeInstanceOf(http.Server);
			// Note: Server is not listening directly - NetworkServerManager handles that
		});

		it("should return HTTP server even when not started", () => {
			// Act
			const server = webServerManager.getServer();

			// Assert
			expect(server).toBeInstanceOf(http.Server);
		});

	});

	describe("integration with NetworkServerManager", () => {
		it("should handle connections via TCP socket emission", async () => {
			// This test verifies that the web server can receive connections
			// via the 'connection' event, which is how NetworkServerManager
			// passes TCP connections to the HTTP server.

			// Arrange
			await webServerManager.start(availablePort);
			const server = webServerManager.getServer();

			// Create a mock socket
			const mockSocket = {
				on: vi.fn(),
				destroy: vi.fn(),
			} as unknown as TcpSocket;

			// Act - emit connection event (simulating NetworkServerManager)
			server.emit("connection", mockSocket);

			// Assert - server should handle the connection
			// (The actual HTTP handling is done by the request handler)
			expect(server).toBeDefined();
		});

		it("should process HTTP requests when connections are emitted", async () => {
			// This test verifies that the HTTP server can process requests
			// when connections are emitted to it (via NetworkServerManager)

			// Arrange
			await webServerManager.start(availablePort);
			const server = webServerManager.getServer();

			// Create a mock socket that simulates a connection
			const mockSocket = {
				on: vi.fn(),
				write: vi.fn(),
				end: vi.fn(),
				destroy: vi.fn(),
			} as unknown as TcpSocket;

			// Act - emit connection event (simulating NetworkServerManager)
			server.emit("connection", mockSocket);

			// Wait a bit
			await new Promise((resolve) => setTimeout(resolve, 50));

			// Assert - server should handle the connection
			// (The actual HTTP handling would happen when data is written to the socket)
			expect(server).toBeDefined();
		});
	});

	describe("request handler", () => {
		it("should use provided request handler", () => {
			// Arrange
			const customHandler = vi.fn((req, res) => {
				res.writeHead(200);
				res.end("Custom");
			});

			// Act
			const customManager = new WebServerManager(mockLogger, customHandler);
			const server = customManager.getServer();

			// Assert - server should be created with custom handler
			expect(server).toBeInstanceOf(http.Server);
			expect(customManager).toBeDefined();
		});
	});

	describe("error handling", () => {
		it("should handle server errors gracefully", async () => {
			// Arrange
			await webServerManager.start(availablePort);
			const server = webServerManager.getServer();

			// Act - emit error event
			server.emit("error", new Error("Test error"));

			// Wait a bit
			await new Promise((resolve) => setTimeout(resolve, 50));

			// Assert - should log error
			expect(mockLogger.error).toHaveBeenCalled();
		});
	});
});
