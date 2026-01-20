import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ServerLogger } from "rusty-motors-shared";
import { GatewayConfiguration } from "../../src/configuration/GatewayConfiguration.js";

/**
 * Tests for GatewayConfiguration
 * 
 * Following TDD principles - tests written before implementation.
 * 
 * GatewayConfiguration wraps the shared Configuration and manages
 * Gateway-specific configuration (ports, backlog, etc.).
 */
describe("GatewayConfiguration", () => {
	let mockLogger: ServerLogger;
	let mockSharedConfig: any;

	beforeEach(() => {
		mockLogger = {
			debug: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
		} as unknown as ServerLogger;

		// Mock shared Configuration object
		mockSharedConfig = {
			host: "test.example.com",
			certificateFile: "/path/to/cert.pem",
			privateKeyFile: "/path/to/key.pem",
			publicKeyFile: "/path/to/pub.pem",
			logLevel: "debug",
		};
	});

	describe("constructor", () => {
		it("should create GatewayConfiguration with default values", () => {
			// Act
			const config = new GatewayConfiguration({
				sharedConfig: mockSharedConfig,
			});

			// Assert
			expect(config.getTcpPorts()).toEqual([]);
			expect(config.getUdpPorts()).toEqual([]);
			expect(config.getWebPort()).toBe(3000);
			expect(config.getBacklogAllowedCount()).toBe(0);
		});

		it("should create GatewayConfiguration with custom values", () => {
			// Act
			const config = new GatewayConfiguration({
				sharedConfig: mockSharedConfig,
				tcpPorts: [7003, 8226],
				udpPorts: [6660],
				webPort: 8080,
				backlogAllowedCount: 10,
			});

			// Assert
			expect(config.getTcpPorts()).toEqual([7003, 8226]);
			expect(config.getUdpPorts()).toEqual([6660]);
			expect(config.getWebPort()).toBe(8080);
			expect(config.getBacklogAllowedCount()).toBe(10);
		});

		it("should store shared configuration", () => {
			// Act
			const config = new GatewayConfiguration({
				sharedConfig: mockSharedConfig,
			});

			// Assert
			expect(config.getSharedConfig()).toBe(mockSharedConfig);
		});
	});

	describe("getTcpPorts", () => {
		it("should return TCP ports array", () => {
			// Arrange
			const config = new GatewayConfiguration({
				sharedConfig: mockSharedConfig,
				tcpPorts: [7003, 8226, 8227],
			});

			// Act
			const ports = config.getTcpPorts();

			// Assert
			expect(ports).toEqual([7003, 8226, 8227]);
		});

		it("should return empty array when no ports configured", () => {
			// Arrange
			const config = new GatewayConfiguration({
				sharedConfig: mockSharedConfig,
			});

			// Act
			const ports = config.getTcpPorts();

			// Assert
			expect(ports).toEqual([]);
		});

		it("should return a copy of the ports array", () => {
			// Arrange
			const config = new GatewayConfiguration({
				sharedConfig: mockSharedConfig,
				tcpPorts: [7003, 8226],
			});

			// Act
			const ports1 = config.getTcpPorts();
			const ports2 = config.getTcpPorts();

			// Assert - should be different array instances
			expect(ports1).not.toBe(ports2);
			expect(ports1).toEqual(ports2);
		});
	});

	describe("getUdpPorts", () => {
		it("should return UDP ports array", () => {
			// Arrange
			const config = new GatewayConfiguration({
				sharedConfig: mockSharedConfig,
				udpPorts: [6660, 6661],
			});

			// Act
			const ports = config.getUdpPorts();

			// Assert
			expect(ports).toEqual([6660, 6661]);
		});

		it("should return empty array when no ports configured", () => {
			// Arrange
			const config = new GatewayConfiguration({
				sharedConfig: mockSharedConfig,
			});

			// Act
			const ports = config.getUdpPorts();

			// Assert
			expect(ports).toEqual([]);
		});

		it("should return a copy of the ports array", () => {
			// Arrange
			const config = new GatewayConfiguration({
				sharedConfig: mockSharedConfig,
				udpPorts: [6660],
			});

			// Act
			const ports1 = config.getUdpPorts();
			const ports2 = config.getUdpPorts();

			// Assert - should be different array instances
			expect(ports1).not.toBe(ports2);
			expect(ports1).toEqual(ports2);
		});
	});

	describe("getWebPort", () => {
		it("should return web port", () => {
			// Arrange
			const config = new GatewayConfiguration({
				sharedConfig: mockSharedConfig,
				webPort: 8080,
			});

			// Act
			const port = config.getWebPort();

			// Assert
			expect(port).toBe(8080);
		});

		it("should return default web port (3000)", () => {
			// Arrange
			const config = new GatewayConfiguration({
				sharedConfig: mockSharedConfig,
			});

			// Act
			const port = config.getWebPort();

			// Assert
			expect(port).toBe(3000);
		});
	});

	describe("getBacklogAllowedCount", () => {
		it("should return backlog count", () => {
			// Arrange
			const config = new GatewayConfiguration({
				sharedConfig: mockSharedConfig,
				backlogAllowedCount: 10,
			});

			// Act
			const backlog = config.getBacklogAllowedCount();

			// Assert
			expect(backlog).toBe(10);
		});

		it("should return default backlog count (0)", () => {
			// Arrange
			const config = new GatewayConfiguration({
				sharedConfig: mockSharedConfig,
			});

			// Act
			const backlog = config.getBacklogAllowedCount();

			// Assert
			expect(backlog).toBe(0);
		});
	});

	describe("getSharedConfig", () => {
		it("should return shared configuration object", () => {
			// Arrange
			const config = new GatewayConfiguration({
				sharedConfig: mockSharedConfig,
			});

			// Act
			const shared = config.getSharedConfig();

			// Assert
			expect(shared).toBe(mockSharedConfig);
			expect(shared.host).toBe("test.example.com");
			expect(shared.certificateFile).toBe("/path/to/cert.pem");
		});
	});

	describe("shard list ports", () => {
		it("should return default shard list ports", () => {
			// Arrange
			const config = new GatewayConfiguration({
				sharedConfig: mockSharedConfig,
			});

			// Act & Assert
			expect(config.getLoginServerPort()).toBe(8226);
			expect(config.getLobbyServerPort()).toBe(7003);
			expect(config.getDiagnosticServerPort()).toBe(80);
		});

		it("should return custom shard list ports", () => {
			// Arrange
			const config = new GatewayConfiguration({
				sharedConfig: mockSharedConfig,
				loginServerPort: 9000,
				lobbyServerPort: 9001,
				diagnosticServerPort: 8080,
			});

			// Act & Assert
			expect(config.getLoginServerPort()).toBe(9000);
			expect(config.getLobbyServerPort()).toBe(9001);
			expect(config.getDiagnosticServerPort()).toBe(8080);
		});
	});

	describe("integration", () => {
		it("should handle complete Gateway configuration", () => {
			// Arrange
			const config = new GatewayConfiguration({
				sharedConfig: mockSharedConfig,
				tcpPorts: [7003, 8226, 8227, 8228],
				udpPorts: [6660],
				webPort: 3000,
				backlogAllowedCount: 5,
				loginServerPort: 8226,
				lobbyServerPort: 7003,
				diagnosticServerPort: 80,
			});

			// Act & Assert
			expect(config.getTcpPorts()).toEqual([7003, 8226, 8227, 8228]);
			expect(config.getUdpPorts()).toEqual([6660]);
			expect(config.getWebPort()).toBe(3000);
			expect(config.getBacklogAllowedCount()).toBe(5);
			expect(config.getLoginServerPort()).toBe(8226);
			expect(config.getLobbyServerPort()).toBe(7003);
			expect(config.getDiagnosticServerPort()).toBe(80);
			expect(config.getSharedConfig().host).toBe("test.example.com");
		});
	});
});
