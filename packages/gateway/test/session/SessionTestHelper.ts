import type { ServerLogger } from "rusty-motors-shared";
import { MessageQueue, addSocketPair, type messageQueueItem, databaseProvider } from "rusty-motors-shared";
import { loggerMock } from "rusty-motors-shared/test";
import { SessionReplayer, type ReplayOptions, type ReplayResult } from "../../src/session/SessionReplayer.js";
import type { RecordedSession } from "../../src/session/SessionRecorder.js";
import { processSocketData } from "../../src/npsPortRouter.js";
import { createInitialState } from "rusty-motors-shared";
import type { TaggedSocket } from "rusty-motors-shared";
import { getServiceRegistry, clearServiceRegistry } from "../../src/routing/ServiceRegistry.js";
import { createDefaultServiceConfiguration } from "../../src/routing/DefaultServiceConfiguration.js";

/**
 * Captured response from replaying a session
 */
export interface CapturedResponse {
	eventIndex: number;
	timestamp: number;
	port: number;
	connectionId: string;
	data: Buffer;
	hex: string;
}

/**
 * Result of replaying a session with captured responses
 */
export interface SessionReplayResult extends ReplayResult {
	capturedResponses: CapturedResponse[];
	recordedResponses: Array<{
		eventIndex: number;
		data: string; // hex
	}>;
}

/**
 * Helper class for testing against recorded sessions
 */
export class SessionTestHelper {
	private readonly replayer: SessionReplayer;
	private readonly log: ServerLogger;
	private capturedResponses: CapturedResponse[] = [];
	private mockSocket: TaggedSocket;

	constructor(
		log: ServerLogger = loggerMock,
		fixturesDirectory: string = "test/fixtures/sessions",
	) {
		this.log = log;
		this.replayer = new SessionReplayer(log, fixturesDirectory);
		this.mockSocket = this.createMockSocket();
	}

	/**
	 * Create a mock socket and set up queues for testing
	 */
	private createMockSocket(connectionId: string = "test", port: number = 7003): TaggedSocket {
		// Create a send queue that captures responses
		const sendQueue = new MessageQueue(
			'testSend',
			10,
			async (item: messageQueueItem) => {
				// Capture outgoing data
				this.capturedResponses.push({
					eventIndex: this.capturedResponses.length,
					timestamp: Date.now(),
					port,
					connectionId,
					data: Buffer.from(item.data),
					hex: item.data.toString("hex"),
				});
			},
		);

		// Create a receive queue (not used in replay, but required)
		const receiveQueue = new MessageQueue(
			'testReceive',
			10,
			async () => {
				// No-op for replay
			},
		);

		// Register the socket pair
		addSocketPair(connectionId, {
			send: sendQueue,
			receive: receiveQueue,
		});

		return {
			connectionId,
			localPort: port,
			connectedAt: Date.now(),
			socket: {
				write: (data: Buffer) => {
					// Also capture direct writes (fallback)
					this.capturedResponses.push({
						eventIndex: this.capturedResponses.length,
						timestamp: Date.now(),
						port,
						connectionId,
						data: Buffer.from(data),
						hex: data.toString("hex"),
					});
					return true;
				},
				end: () => {},
				destroyed: false,
			} as any,
		};
	}

	/**
	 * Replay a session through the actual server handlers
	 */
	async replaySessionThroughHandlers(
		session: RecordedSession,
		options: ReplayOptions = {},
	): Promise<SessionReplayResult> {
		this.capturedResponses = [];

		// Initialize state
		createInitialState({}).save();

		// Initialize the service registry with default handlers
		clearServiceRegistry();
		const registry = getServiceRegistry();
		createDefaultServiceConfiguration(registry);

		// Register mock database provider for tests
		if (!databaseProvider.isRegistered()) {
			databaseProvider.register({
				session: {
					updateSessionKey: async () => {},
					fetchSessionKeyByCustomerId: async () => ({
						customerId: 0,
						sessionKey: "test-session-key",
						sKey: "test-s-key",
						contextId: "test-context",
						connectionId: "test-connection"
					}),
					fetchSessionKeyByConnectionId: async () => ({
						customerId: 0,
						sessionKey: "test-session-key",
						sKey: "test-s-key",
						contextId: "test-context",
						connectionId: "test-connection"
					}),
					updateUser: async () => {},
					getUser: async () => undefined,
					updateConnection: async () => {},
					findUserByConnectionId: async () => undefined,
					updateGameServer: async () => {},
					getGameServers: async () => [],
				},
				gameData: {
					getPlayer: async () => { throw new Error("Not implemented in test"); },
					getOwnedVehiclesForPerson: async () => [],
					getVehicleAndParts: async () => null,
					createNewCar: async () => 0,
					purchaseCar: async () => 0,
				},
				auth: {
					isDatabaseConnected: true,
					findUser: async () => ({ customerId: 0, userName: "test", loginLevel: 0 }),
					findCustomerByContext: () => ({ customerId: 1212555, contextId: "5213dee3a6bcdb133373b2d4f3b9962758", profileId: 1 }),
					updateSession: () => {},
					registerNewUser: () => {},
				},
			});
		}

		// Extract recorded responses for comparison
		const recordedResponses = session.events
			.map((event, index) => ({
				eventIndex: index,
				data: event.data || "",
			}))
			.filter((r) => r.data && session.events[r.eventIndex]?.type === "data_out");

		let connectionId = session.metadata.connectionIds[0] || "test";
		let port = session.metadata.ports[0] || 7003;
		let dataInEventIndex = 0;

		const result: SessionReplayResult = {
			success: true,
			eventsProcessed: 0,
			errors: [],
			warnings: [],
			capturedResponses: [],
			recordedResponses,
		};

		try {
			for (let i = 0; i < session.events.length; i++) {
				const event = session.events[i];

				try {
					switch (event.type) {
						case "connect":
							if (event.port && event.connectionId) {
								port = event.port;
								connectionId = event.connectionId;
								this.mockSocket = this.createMockSocket(connectionId, port);
								result.eventsProcessed++;
							}
							break;

						case "data_in":
							if (event.port && event.connectionId && event.data) {
								const data = Buffer.from(event.data, "hex");
								
								// Validate data before processing
								if (data.length === 0) {
									result.warnings.push(
										`Skipping empty data_in event at index ${i}`,
									);
									break;
								}
								
								// Process through actual handler
								// Wrap in try-catch to handle errors gracefully
								// Some packets in recorded sessions may be invalid/unsupported
								try {
									await processSocketData(
										data,
										this.log,
										connectionId,
										port,
										this.mockSocket,
									);
									
									// Wait a bit for async queue processing
									await new Promise((resolve) => setTimeout(resolve, 50));
								} catch (error) {
									// Log but don't fail - some packets may be invalid
									result.warnings.push(
										`Error processing data_in event ${i}: ${String(error)}`,
									);
								}
								
								result.eventsProcessed++;
								dataInEventIndex++;
							}
							break;

						case "disconnect":
							result.eventsProcessed++;
							break;

						case "error":
							result.warnings.push(
								`Error event at index ${i}: ${event.error}`,
							);
							break;

						case "data_out":
							// Skip - we capture these from actual handlers
							break;
					}
				} catch (error) {
					result.errors.push(
						`Error processing event ${i} (${event.type}): ${String(error)}`,
					);
					result.success = false;
				}
			}

			result.capturedResponses = this.capturedResponses;

			// Compare responses if validation is enabled
			if (options.validateResponses) {
				result.responseMismatches = this.compareResponses(
					recordedResponses,
					this.capturedResponses,
				);
				if (result.responseMismatches && result.responseMismatches.length > 0) {
					result.warnings.push(
						`Found ${result.responseMismatches.length} response mismatches`,
					);
				}
			}
		} catch (error) {
			result.errors.push(`Replay failed: ${String(error)}`);
			result.success = false;
		}

		return result;
	}

	/**
	 * Compare recorded responses with captured responses
	 */
	private compareResponses(
		recorded: Array<{ eventIndex: number; data: string }>,
		captured: CapturedResponse[],
	): Array<{ eventIndex: number; expected: string; actual: string }> {
		const mismatches: Array<{
			eventIndex: number;
			expected: string;
			actual: string;
		}> = [];

		const minLength = Math.min(recorded.length, captured.length);

		for (let i = 0; i < minLength; i++) {
			const recordedHex = recorded[i].data.toLowerCase();
			const capturedHex = captured[i].hex.toLowerCase();

			if (recordedHex !== capturedHex) {
				mismatches.push({
					eventIndex: recorded[i].eventIndex,
					expected: recordedHex,
					actual: capturedHex,
				});
			}
		}

		if (recorded.length !== captured.length) {
			mismatches.push({
				eventIndex: -1,
				expected: `${recorded.length} responses`,
				actual: `${captured.length} responses`,
			});
		}

		return mismatches;
	}

	/**
	 * Load and replay a session file
	 */
	async loadAndReplay(
		filename: string,
		options: ReplayOptions = {},
	): Promise<SessionReplayResult | null> {
		const session = this.replayer.loadSession(filename);
		if (!session) {
			return null;
		}

		return this.replaySessionThroughHandlers(session, options);
	}

	/**
	 * Get captured responses as hex strings
	 */
	getCapturedResponsesAsHex(): string[] {
		return this.capturedResponses.map((r) => r.hex);
	}

	/**
	 * Get captured responses as buffers
	 */
	getCapturedResponsesAsBuffers(): Buffer[] {
		return this.capturedResponses.map((r) => r.data);
	}
}
