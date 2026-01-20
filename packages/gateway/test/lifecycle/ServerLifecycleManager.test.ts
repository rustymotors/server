import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ServerLogger } from "rusty-motors-shared";
import {
	ServerLifecycleManager,
	ServerStatus,
	type LifecycleManager,
} from "../../src/lifecycle/ServerLifecycleManager.js";

describe("ServerLifecycleManager", () => {
	let mockLogger: ServerLogger;
	let lifecycleManager: LifecycleManager;

	beforeEach(() => {
		mockLogger = {
			debug: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
		} as unknown as ServerLogger;

		lifecycleManager = new ServerLifecycleManager(mockLogger);
	});

	describe("initialization", () => {
		it("should initialize with STOPPED status", () => {
			// assert
			expect(lifecycleManager.getStatus()).toBe(ServerStatus.STOPPED);
		});

		it("should log status change when setting status", () => {
			// act
			lifecycleManager.setStatus(ServerStatus.STARTING);

			// assert
			expect(mockLogger.debug).toHaveBeenCalledWith(
				expect.stringContaining("Status changed:"),
			);
		});
	});

	describe("getStatus", () => {
		it("should return the current status", () => {
			// arrange
			lifecycleManager.setStatus(ServerStatus.RUNNING);

			// act
			const status = lifecycleManager.getStatus();

			// assert
			expect(status).toBe(ServerStatus.RUNNING);
		});

		it("should return STOPPED by default", () => {
			// act
			const status = lifecycleManager.getStatus();

			// assert
			expect(status).toBe(ServerStatus.STOPPED);
		});
	});

	describe("setStatus", () => {
		it("should update the status", () => {
			// act
			lifecycleManager.setStatus(ServerStatus.STARTING);

			// assert
			expect(lifecycleManager.getStatus()).toBe(ServerStatus.STARTING);
		});

		it("should log status changes", () => {
			// act
			lifecycleManager.setStatus(ServerStatus.RUNNING);

			// assert
			expect(mockLogger.debug).toHaveBeenCalledWith(
				`Status changed: ${ServerStatus.STOPPED} -> ${ServerStatus.RUNNING}`,
			);
		});

		it("should handle all status transitions", () => {
			// act & assert
			lifecycleManager.setStatus(ServerStatus.STARTING);
			expect(lifecycleManager.getStatus()).toBe(ServerStatus.STARTING);

			lifecycleManager.setStatus(ServerStatus.RUNNING);
			expect(lifecycleManager.getStatus()).toBe(ServerStatus.RUNNING);

			lifecycleManager.setStatus(ServerStatus.STOPPING);
			expect(lifecycleManager.getStatus()).toBe(ServerStatus.STOPPING);

			lifecycleManager.setStatus(ServerStatus.STOPPED);
			expect(lifecycleManager.getStatus()).toBe(ServerStatus.STOPPED);

			lifecycleManager.setStatus(ServerStatus.RESTARTING);
			expect(lifecycleManager.getStatus()).toBe(ServerStatus.RESTARTING);
		});
	});

	describe("isRunning", () => {
		it("should return false when status is STOPPED", () => {
			// arrange
			lifecycleManager.setStatus(ServerStatus.STOPPED);

			// act
			const isRunning = lifecycleManager.isRunning();

			// assert
			expect(isRunning).toBe(false);
		});

		it("should return true when status is RUNNING", () => {
			// arrange
			lifecycleManager.setStatus(ServerStatus.RUNNING);

			// act
			const isRunning = lifecycleManager.isRunning();

			// assert
			expect(isRunning).toBe(true);
		});

		it("should return false when status is STARTING", () => {
			// arrange
			lifecycleManager.setStatus(ServerStatus.STARTING);

			// act
			const isRunning = lifecycleManager.isRunning();

			// assert
			expect(isRunning).toBe(false);
		});

		it("should return false when status is STOPPING", () => {
			// arrange
			lifecycleManager.setStatus(ServerStatus.STOPPING);

			// act
			const isRunning = lifecycleManager.isRunning();

			// assert
			expect(isRunning).toBe(false);
		});

		it("should return false when status is RESTARTING", () => {
			// arrange
			lifecycleManager.setStatus(ServerStatus.RESTARTING);

			// act
			const isRunning = lifecycleManager.isRunning();

			// assert
			expect(isRunning).toBe(false);
		});
	});

	describe("canStart", () => {
		it("should return true when status is STOPPED", () => {
			// arrange
			lifecycleManager.setStatus(ServerStatus.STOPPED);

			// act
			const canStart = lifecycleManager.canStart();

			// assert
			expect(canStart).toBe(true);
		});

		it("should return false when status is RUNNING", () => {
			// arrange
			lifecycleManager.setStatus(ServerStatus.RUNNING);

			// act
			const canStart = lifecycleManager.canStart();

			// assert
			expect(canStart).toBe(false);
		});

		it("should return false when status is STARTING", () => {
			// arrange
			lifecycleManager.setStatus(ServerStatus.STARTING);

			// act
			const canStart = lifecycleManager.canStart();

			// assert
			expect(canStart).toBe(false);
		});

		it("should return false when status is STOPPING", () => {
			// arrange
			lifecycleManager.setStatus(ServerStatus.STOPPING);

			// act
			const canStart = lifecycleManager.canStart();

			// assert
			expect(canStart).toBe(false);
		});

		it("should return false when status is RESTARTING", () => {
			// arrange
			lifecycleManager.setStatus(ServerStatus.RESTARTING);

			// act
			const canStart = lifecycleManager.canStart();

			// assert
			expect(canStart).toBe(false);
		});
	});

	describe("canStop", () => {
		it("should return true when status is RUNNING", () => {
			// arrange
			lifecycleManager.setStatus(ServerStatus.RUNNING);

			// act
			const canStop = lifecycleManager.canStop();

			// assert
			expect(canStop).toBe(true);
		});

		it("should return false when status is STOPPED", () => {
			// arrange
			lifecycleManager.setStatus(ServerStatus.STOPPED);

			// act
			const canStop = lifecycleManager.canStop();

			// assert
			expect(canStop).toBe(false);
		});

		it("should return false when status is STARTING", () => {
			// arrange
			lifecycleManager.setStatus(ServerStatus.STARTING);

			// act
			const canStop = lifecycleManager.canStop();

			// assert
			expect(canStop).toBe(false);
		});

		it("should return false when status is STOPPING", () => {
			// arrange
			lifecycleManager.setStatus(ServerStatus.STOPPING);

			// act
			const canStop = lifecycleManager.canStop();

			// assert
			expect(canStop).toBe(false);
		});

		it("should return false when status is RESTARTING", () => {
			// arrange
			lifecycleManager.setStatus(ServerStatus.RESTARTING);

			// act
			const canStop = lifecycleManager.canStop();

			// assert
			expect(canStop).toBe(false);
		});
	});

	describe("status transitions", () => {
		it("should allow transition from STOPPED to STARTING", () => {
			// arrange
			lifecycleManager.setStatus(ServerStatus.STOPPED);

			// act
			lifecycleManager.setStatus(ServerStatus.STARTING);

			// assert
			expect(lifecycleManager.getStatus()).toBe(ServerStatus.STARTING);
			expect(lifecycleManager.canStart()).toBe(false);
		});

		it("should allow transition from STARTING to RUNNING", () => {
			// arrange
			lifecycleManager.setStatus(ServerStatus.STARTING);

			// act
			lifecycleManager.setStatus(ServerStatus.RUNNING);

			// assert
			expect(lifecycleManager.getStatus()).toBe(ServerStatus.RUNNING);
			expect(lifecycleManager.isRunning()).toBe(true);
		});

		it("should allow transition from RUNNING to STOPPING", () => {
			// arrange
			lifecycleManager.setStatus(ServerStatus.RUNNING);

			// act
			lifecycleManager.setStatus(ServerStatus.STOPPING);

			// assert
			expect(lifecycleManager.getStatus()).toBe(ServerStatus.STOPPING);
			expect(lifecycleManager.canStop()).toBe(false);
		});

		it("should allow transition from STOPPING to STOPPED", () => {
			// arrange
			lifecycleManager.setStatus(ServerStatus.STOPPING);

			// act
			lifecycleManager.setStatus(ServerStatus.STOPPED);

			// assert
			expect(lifecycleManager.getStatus()).toBe(ServerStatus.STOPPED);
			expect(lifecycleManager.canStart()).toBe(true);
		});

		it("should allow transition from RUNNING to RESTARTING", () => {
			// arrange
			lifecycleManager.setStatus(ServerStatus.RUNNING);

			// act
			lifecycleManager.setStatus(ServerStatus.RESTARTING);

			// assert
			expect(lifecycleManager.getStatus()).toBe(ServerStatus.RESTARTING);
		});

		it("should allow transition from RESTARTING to STOPPED", () => {
			// arrange
			lifecycleManager.setStatus(ServerStatus.RESTARTING);

			// act
			lifecycleManager.setStatus(ServerStatus.STOPPED);

			// assert
			expect(lifecycleManager.getStatus()).toBe(ServerStatus.STOPPED);
		});
	});

	describe("multiple instances", () => {
		it("should maintain independent state for multiple instances", () => {
			// arrange
			const manager1 = new ServerLifecycleManager(mockLogger);
			const manager2 = new ServerLifecycleManager(mockLogger);

			// act
			manager1.setStatus(ServerStatus.RUNNING);
			manager2.setStatus(ServerStatus.STOPPING);

			// assert
			expect(manager1.getStatus()).toBe(ServerStatus.RUNNING);
			expect(manager2.getStatus()).toBe(ServerStatus.STOPPING);
			expect(manager1.isRunning()).toBe(true);
			expect(manager2.isRunning()).toBe(false);
		});
	});
});
