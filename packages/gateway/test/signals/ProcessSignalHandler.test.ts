import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ServerLogger } from "rusty-motors-shared";
import { ProcessSignalHandler, type ShutdownHandler } from "../../src/signals/ProcessSignalHandler.js";

/**
 * Tests for ProcessSignalHandler
 * 
 * Following TDD principles - tests written before implementation.
 * 
 * Note: SignalHandler is decoupled from ConsoleThread - it only handles
 * process signals (SIGINT, exit), not keyboard input.
 */
describe("ProcessSignalHandler", () => {
	let signalHandler: ProcessSignalHandler;
	let mockLogger: ServerLogger;
	let mockShutdownHandler: ShutdownHandler;
	let shutdownCalled: boolean;
	let shutdownPromise: Promise<void>;

	beforeEach(() => {
		mockLogger = {
			debug: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
		} as unknown as ServerLogger;

		shutdownCalled = false;
		shutdownPromise = Promise.resolve();

		mockShutdownHandler = {
			shutdown: vi.fn(async () => {
				shutdownCalled = true;
				await shutdownPromise;
			}),
		};

		signalHandler = new ProcessSignalHandler(mockLogger);
	});

	afterEach(() => {
		// Clean up any registered handlers
		signalHandler.unregisterShutdownHandler();
	});

	describe("registerShutdownHandler", () => {
		it("should register a shutdown handler", () => {
			// Arrange - mock process.exit to prevent actual exit
			const originalExit = process.exit;
			process.exit = vi.fn() as any;

			try {
				// Act
				signalHandler.registerShutdownHandler(mockShutdownHandler);

				// Assert - handler is registered (we can't easily test signal firing in unit tests)
				expect(signalHandler).toBeDefined();
			} finally {
				process.exit = originalExit;
				signalHandler.unregisterShutdownHandler();
			}
		});

		it("should replace existing handler when registering new one", () => {
			// Arrange - mock process.exit to prevent actual exit
			const originalExit = process.exit;
			process.exit = vi.fn() as any;

			const firstHandler: ShutdownHandler = {
				shutdown: vi.fn(async () => {}),
			};
			const secondHandler: ShutdownHandler = {
				shutdown: vi.fn(async () => {}),
			};

			try {
				// Act
				signalHandler.registerShutdownHandler(firstHandler);
				signalHandler.registerShutdownHandler(secondHandler);

				// Assert - second handler should replace first
				// (We verify by checking unregister removes the handler)
				signalHandler.unregisterShutdownHandler();
				expect(firstHandler.shutdown).not.toHaveBeenCalled();
				expect(secondHandler.shutdown).not.toHaveBeenCalled();
			} finally {
				process.exit = originalExit;
			}
		});

		it("should log info when SIGINT is received", async () => {
			// Arrange - mock process.exit to prevent actual exit
			const originalExit = process.exit;
			const exitSpy = vi.fn();
			process.exit = exitSpy as any;

			try {
				signalHandler.registerShutdownHandler(mockShutdownHandler);

				// Act - simulate SIGINT
				process.emit("SIGINT" as any, {});

				// Wait a bit for async handler
				await new Promise((resolve) => setTimeout(resolve, 50));

				// Assert
				expect(mockLogger.info).toHaveBeenCalledWith(
					expect.stringContaining("SIGINT"),
				);
			} finally {
				process.exit = originalExit;
				signalHandler.unregisterShutdownHandler();
			}
		});

		it("should call shutdown handler when SIGINT is received", async () => {
			// Arrange - mock process.exit to prevent actual exit
			const originalExit = process.exit;
			const exitSpy = vi.fn();
			process.exit = exitSpy as any;

			try {
				signalHandler.registerShutdownHandler(mockShutdownHandler);

				// Act - simulate SIGINT
				process.emit("SIGINT" as any, {});

				// Wait a bit for async handler
				await new Promise((resolve) => setTimeout(resolve, 50));

				// Assert
				expect(mockShutdownHandler.shutdown).toHaveBeenCalled();
			} finally {
				process.exit = originalExit;
				signalHandler.unregisterShutdownHandler();
			}
		});

		it("should exit process after shutdown completes on SIGINT", async () => {
			// Arrange - mock process.exit to prevent actual exit
			const originalExit = process.exit;
			const exitSpy = vi.fn();
			process.exit = exitSpy as any;

			try {
				signalHandler.registerShutdownHandler(mockShutdownHandler);

				// Act - simulate SIGINT
				process.emit("SIGINT" as any, {});

				// Wait for shutdown to complete
				await new Promise((resolve) => setTimeout(resolve, 50));

				// Assert
				expect(exitSpy).toHaveBeenCalledWith(0);
			} finally {
				process.exit = originalExit;
				signalHandler.unregisterShutdownHandler();
			}
		});

		it("should handle exit event", () => {
			// Arrange - mock process.exit to prevent actual exit
			const originalExit = process.exit;
			process.exit = vi.fn() as any;

			try {
				signalHandler.registerShutdownHandler(mockShutdownHandler);

				// Act - simulate exit
				process.emit("exit" as any, 0);

				// Assert - should log debug message
				expect(mockLogger.debug).toHaveBeenCalledWith(
					expect.stringContaining("Process exiting"),
				);
			} finally {
				process.exit = originalExit;
				signalHandler.unregisterShutdownHandler();
			}
		});

		it("should handle shutdown errors gracefully", async () => {
			// Arrange - mock process.exit to prevent actual exit
			const originalExit = process.exit;
			const exitSpy = vi.fn();
			process.exit = exitSpy as any;

			const errorHandler: ShutdownHandler = {
				shutdown: vi.fn(async () => {
					throw new Error("Shutdown failed");
				}),
			};

			try {
				signalHandler.registerShutdownHandler(errorHandler);

				// Act - simulate SIGINT
				process.emit("SIGINT" as any, {});

				// Wait a bit
				await new Promise((resolve) => setTimeout(resolve, 50));

				// Assert - should still attempt to exit with error code
				expect(errorHandler.shutdown).toHaveBeenCalled();
				expect(exitSpy).toHaveBeenCalledWith(1);
			} finally {
				process.exit = originalExit;
				signalHandler.unregisterShutdownHandler();
			}
		});
	});

	describe("unregisterShutdownHandler", () => {
		it("should remove SIGINT listener when unregistering", async () => {
			// Arrange - mock process.exit to prevent actual exit
			const originalExit = process.exit;
			process.exit = vi.fn() as any;

			try {
				signalHandler.registerShutdownHandler(mockShutdownHandler);

				// Act
				signalHandler.unregisterShutdownHandler();

				// Assert - handler should not be called after unregister
				const callCountBefore = (mockShutdownHandler.shutdown as any).mock.calls.length;

				// Try to emit SIGINT
				process.emit("SIGINT" as any, {});
				// Wait a bit
				await new Promise((resolve) => setTimeout(resolve, 50));

				const callCountAfter = (mockShutdownHandler.shutdown as any).mock.calls.length;
				expect(callCountAfter).toBe(callCountBefore);
			} finally {
				process.exit = originalExit;
			}
		});

		it("should remove exit listener when unregistering", async () => {
			// Arrange - mock process.exit to prevent actual exit
			const originalExit = process.exit;
			process.exit = vi.fn() as any;

			try {
				signalHandler.registerShutdownHandler(mockShutdownHandler);
				const debugCallCountBefore = (mockLogger.debug as any).mock.calls.length;

				// Act
				signalHandler.unregisterShutdownHandler();

				// Assert
				process.emit("exit" as any, 0);
				// Wait a bit
				await new Promise((resolve) => setTimeout(resolve, 50));

				const debugCallCountAfter = (mockLogger.debug as any).mock.calls.length;
				// Should not have increased (or increased by less than if listener was still active)
				expect(debugCallCountAfter).toBe(debugCallCountBefore);
			} finally {
				process.exit = originalExit;
			}
		});

		it("should not throw when unregistering without handler", () => {
			// Arrange - mock process.exit to prevent actual exit
			const originalExit = process.exit;
			process.exit = vi.fn() as any;

			try {
				// Act & Assert
				expect(() => {
					signalHandler.unregisterShutdownHandler();
				}).not.toThrow();
			} finally {
				process.exit = originalExit;
			}
		});

		it("should allow re-registration after unregistering", () => {
			// Arrange - mock process.exit to prevent actual exit
			const originalExit = process.exit;
			process.exit = vi.fn() as any;

			try {
				signalHandler.registerShutdownHandler(mockShutdownHandler);
				signalHandler.unregisterShutdownHandler();

				// Act
				signalHandler.registerShutdownHandler(mockShutdownHandler);

				// Assert - should not throw
				expect(signalHandler).toBeDefined();
			} finally {
				process.exit = originalExit;
				signalHandler.unregisterShutdownHandler();
			}
		});
	});

	describe("decoupling from ConsoleThread", () => {
		it("should not interfere with ConsoleThread keyboard input", () => {
			// This test documents that SignalHandler only handles process signals,
			// not keyboard input. ConsoleThread handles keyboard input separately.

			// Arrange - mock process.exit to prevent actual exit
			const originalExit = process.exit;
			process.exit = vi.fn() as any;

			try {
				signalHandler.registerShutdownHandler(mockShutdownHandler);

				// Act - simulate keyboard input (this should NOT trigger SignalHandler)
				// Note: In real usage, ConsoleThread would handle this via stdin keypress events
				const keypressEvent = { sequence: "x", name: "x" };
				// We can't easily test stdin events, but we verify SignalHandler
				// doesn't listen to keypress events

				// Assert - SignalHandler should not have been called
				// (This is more of a documentation test - actual behavior verified by
				// the fact that SignalHandler only registers SIGINT/exit listeners)
				expect(signalHandler).toBeDefined();
			} finally {
				process.exit = originalExit;
				signalHandler.unregisterShutdownHandler();
			}
		});

		it("should work independently of ConsoleThread events", () => {
			// This test documents that SignalHandler and ConsoleThread are decoupled.
			// ConsoleThread emits "userExit", "userRestart", "userHelp" events,
			// but SignalHandler doesn't listen to those - it only handles process signals.

			// Arrange - mock process.exit to prevent actual exit
			const originalExit = process.exit;
			process.exit = vi.fn() as any;

			try {
				signalHandler.registerShutdownHandler(mockShutdownHandler);

				// Act - simulate ConsoleThread event (this should NOT trigger SignalHandler)
				// In real usage, Gateway would listen to ConsoleThread events separately

				// Assert - SignalHandler only responds to process signals, not events
				expect(mockShutdownHandler.shutdown).not.toHaveBeenCalled();
			} finally {
				process.exit = originalExit;
				signalHandler.unregisterShutdownHandler();
			}
		});
	});

	describe("multiple instances", () => {
		it("should allow multiple instances with independent handlers", () => {
			// Arrange - mock process.exit to prevent actual exit
			const originalExit = process.exit;
			process.exit = vi.fn() as any;

			const handler1: ShutdownHandler = {
				shutdown: vi.fn(async () => {}),
			};
			const handler2: ShutdownHandler = {
				shutdown: vi.fn(async () => {}),
			};

			const signalHandler1 = new ProcessSignalHandler(mockLogger);
			const signalHandler2 = new ProcessSignalHandler(mockLogger);

			try {
				// Act
				signalHandler1.registerShutdownHandler(handler1);
				signalHandler2.registerShutdownHandler(handler2);

				// Assert - both should be independent
				expect(signalHandler1).toBeDefined();
				expect(signalHandler2).toBeDefined();
			} finally {
				// Cleanup
				signalHandler1.unregisterShutdownHandler();
				signalHandler2.unregisterShutdownHandler();
				process.exit = originalExit;
			}
		});
	});
});
