import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ServerLogger, TaggedTcpSocket } from "rusty-motors-shared";
import { PortRouterRegistry, type PortMapping } from "../../src/routing/PortRouterRegistry.js";
import type { PortRouter } from "../../src/types.js";

/**
 * Tests for PortRouterRegistry
 * 
 * Following TDD principles - tests written before implementation.
 */
describe("PortRouterRegistry", () => {
	let registry: PortRouterRegistry;
	let mockRouter1: PortRouter;
	let mockRouter2: PortRouter;
	let mockTaggedSocket: TaggedTcpSocket;

	beforeEach(() => {
		registry = new PortRouterRegistry();

		// Create mock routers
		mockRouter1 = vi.fn(async ({ taggedSocket }: { taggedSocket: TaggedTcpSocket }) => {
			// Mock router implementation
		});

		mockRouter2 = vi.fn(async ({ taggedSocket }: { taggedSocket: TaggedTcpSocket }) => {
			// Mock router implementation
		});

		// Create mock tagged socket
		mockTaggedSocket = {
			socket: {} as any,
			connectionId: "test-connection-1",
			localPort: 7003,
		} as TaggedTcpSocket;
	});

	describe("registerPort", () => {
		it("should register a single port with a router", () => {
			// Act
			registry.registerPort(7003, mockRouter1);

			// Assert
			const router = registry.getRouter(7003);
			expect(router).toBe(mockRouter1);
		});

		it("should register multiple ports with different routers", () => {
			// Act
			registry.registerPort(7003, mockRouter1);
			registry.registerPort(8226, mockRouter2);

			// Assert
			expect(registry.getRouter(7003)).toBe(mockRouter1);
			expect(registry.getRouter(8226)).toBe(mockRouter2);
		});

		it("should throw error when registering duplicate port", () => {
			// Arrange
			registry.registerPort(7003, mockRouter1);

			// Act & Assert
			expect(() => {
				registry.registerPort(7003, mockRouter2);
			}).toThrow(`Port 7003 already registered`);
		});

		it("should throw error for invalid port number (negative)", () => {
			// Act & Assert
			expect(() => {
				registry.registerPort(-1, mockRouter1);
			}).toThrow("Invalid port number");
		});

		it("should throw error for invalid port number (too large)", () => {
			// Act & Assert
			expect(() => {
				registry.registerPort(65536, mockRouter1);
			}).toThrow("Invalid port number");
		});

		it("should throw error for invalid port number (non-integer)", () => {
			// Act & Assert
			expect(() => {
				registry.registerPort(7003.5, mockRouter1);
			}).toThrow("Invalid port number");
		});

		it("should accept valid port range boundaries", () => {
			// Act & Assert - should not throw
			expect(() => {
				registry.registerPort(0, mockRouter1);
			}).not.toThrow();

			expect(() => {
				registry.registerPort(65535, mockRouter1);
			}).not.toThrow();
		});
	});

	describe("registerPortRange", () => {
		it("should register a range of ports with the same router", () => {
			// Act
			registry.registerPortRange(9000, 9002, mockRouter1);

			// Assert
			expect(registry.getRouter(9000)).toBe(mockRouter1);
			expect(registry.getRouter(9001)).toBe(mockRouter1);
			expect(registry.getRouter(9002)).toBe(mockRouter1);
		});

		it("should register single port range (start === end)", () => {
			// Act
			registry.registerPortRange(7003, 7003, mockRouter1);

			// Assert
			expect(registry.getRouter(7003)).toBe(mockRouter1);
		});

		it("should throw error when range includes already registered port", () => {
			// Arrange
			registry.registerPort(9001, mockRouter1);

			// Act & Assert
			expect(() => {
				registry.registerPortRange(9000, 9002, mockRouter2);
			}).toThrow(`Port 9001 already registered`);
		});

		it("should throw error for invalid start port", () => {
			// Act & Assert
			expect(() => {
				registry.registerPortRange(-1, 9000, mockRouter1);
			}).toThrow("Invalid port number");
		});

		it("should throw error for invalid end port", () => {
			// Act & Assert
			expect(() => {
				registry.registerPortRange(9000, 65536, mockRouter1);
			}).toThrow("Invalid port number");
		});

		it("should throw error when start > end", () => {
			// Act & Assert
			expect(() => {
				registry.registerPortRange(9002, 9000, mockRouter1);
			}).toThrow("Start port must be less than or equal to end port");
		});
	});

	describe("getRouter", () => {
		it("should return registered router for a port", () => {
			// Arrange
			registry.registerPort(7003, mockRouter1);

			// Act
			const router = registry.getRouter(7003);

			// Assert
			expect(router).toBe(mockRouter1);
		});

		it("should return undefined for unregistered port", () => {
			// Act
			const router = registry.getRouter(9999);

			// Assert
			expect(router).toBeUndefined();
		});

		it("should throw error for invalid port number", () => {
			// Act & Assert
			expect(() => {
				registry.getRouter(-1);
			}).toThrow("Invalid port number");
		});
	});

	describe("getMappings", () => {
		it("should return empty array when no ports registered", () => {
			// Act
			const mappings = registry.getMappings();

			// Assert
			expect(mappings).toEqual([]);
		});

		it("should return all registered port mappings", () => {
			// Arrange
			registry.registerPort(7003, mockRouter1);
			registry.registerPort(8226, mockRouter2);

			// Act
			const mappings = registry.getMappings();

			// Assert
			expect(mappings).toHaveLength(2);
			expect(mappings).toContainEqual({ port: 7003, router: mockRouter1 });
			expect(mappings).toContainEqual({ port: 8226, router: mockRouter2 });
		});

		it("should return mappings for port range", () => {
			// Arrange
			registry.registerPortRange(9000, 9002, mockRouter1);

			// Act
			const mappings = registry.getMappings();

			// Assert
			expect(mappings).toHaveLength(3);
			expect(mappings).toContainEqual({ port: 9000, router: mockRouter1 });
			expect(mappings).toContainEqual({ port: 9001, router: mockRouter1 });
			expect(mappings).toContainEqual({ port: 9002, router: mockRouter1 });
		});

		it("should return mappings in consistent order", () => {
			// Arrange
			registry.registerPort(8226, mockRouter1);
			registry.registerPort(7003, mockRouter2);
			registry.registerPort(8227, mockRouter1);

			// Act
			const mappings = registry.getMappings();

			// Assert
			expect(mappings.length).toBe(3);
			// Should contain all mappings
			const ports = mappings.map(m => m.port).sort();
			expect(ports).toEqual([7003, 8226, 8227]);
		});
	});

	describe("clear", () => {
		it("should remove all registered ports", () => {
			// Arrange
			registry.registerPort(7003, mockRouter1);
			registry.registerPort(8226, mockRouter2);
			registry.registerPortRange(9000, 9002, mockRouter1);

			// Act
			registry.clear();

			// Assert
			expect(registry.getMappings()).toEqual([]);
			expect(registry.getRouter(7003)).toBeUndefined();
			expect(registry.getRouter(8226)).toBeUndefined();
			expect(registry.getRouter(9000)).toBeUndefined();
		});

		it("should allow re-registration after clear", () => {
			// Arrange
			registry.registerPort(7003, mockRouter1);
			registry.clear();

			// Act
			registry.registerPort(7003, mockRouter2);

			// Assert
			expect(registry.getRouter(7003)).toBe(mockRouter2);
		});

		it("should not throw when clearing empty registry", () => {
			// Act & Assert
			expect(() => {
				registry.clear();
			}).not.toThrow();
		});
	});

	describe("integration scenarios", () => {
		it("should handle default port configuration scenario", () => {
			// Simulate default configuration
			registry.registerPort(8226, mockRouter1);
			registry.registerPort(8227, mockRouter1);
			registry.registerPort(8228, mockRouter1);
			registry.registerPort(7003, mockRouter1);
			registry.registerPortRange(9000, 9020, mockRouter1);
			registry.registerPort(10001, mockRouter1);
			registry.registerPort(43300, mockRouter2);

			// Assert all ports are registered
			expect(registry.getRouter(8226)).toBe(mockRouter1);
			expect(registry.getRouter(8227)).toBe(mockRouter1);
			expect(registry.getRouter(8228)).toBe(mockRouter1);
			expect(registry.getRouter(7003)).toBe(mockRouter1);
			expect(registry.getRouter(9000)).toBe(mockRouter1);
			expect(registry.getRouter(9020)).toBe(mockRouter1);
			expect(registry.getRouter(10001)).toBe(mockRouter1);
			expect(registry.getRouter(43300)).toBe(mockRouter2);

			// Verify total count
			const mappings = registry.getMappings();
			// 4 NPS single (8226, 8227, 8228, 7003) + 21 range (9000-9020) + 1 NPS single (10001) + 1 MCOTS single (43300) = 27
			expect(mappings.length).toBe(27);
		});

		it("should handle mixed single and range registrations", () => {
			// Arrange
			registry.registerPort(7003, mockRouter1);
			registry.registerPortRange(9000, 9002, mockRouter1);
			registry.registerPort(8226, mockRouter2);

			// Act
			const mappings = registry.getMappings();

			// Assert
			expect(mappings.length).toBe(5);
			expect(registry.getRouter(7003)).toBe(mockRouter1);
			expect(registry.getRouter(9000)).toBe(mockRouter1);
			expect(registry.getRouter(9001)).toBe(mockRouter1);
			expect(registry.getRouter(9002)).toBe(mockRouter1);
			expect(registry.getRouter(8226)).toBe(mockRouter2);
		});
	});
});
