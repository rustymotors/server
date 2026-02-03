import readline from "readline";
import { getServerLogger, type ServerLogger } from "rusty-motors-shared";
import { saveAllSessions, getSessionRecorder } from "./session/SessionRecorderIntegration.js";

export class HotkeyManager {
	private rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
    private GatewayServer: any;
	private readonly log: ServerLogger;

	constructor(gatewayServer?: any, log: ServerLogger = getServerLogger('HotkeyManager')) {
        this.GatewayServer = gatewayServer;
		this.log = log;
		this.setupHotkeys();
	}

	private setupHotkeys(): void {
		readline.emitKeypressEvents(process.stdin);
		if (process.stdin.isTTY) {
			process.stdin.setRawMode(true);
		}

		process.stdin.on("keypress", (_str, key) => {
			this.handleKeypress(key);
		});

		this.log.info('Hotkeys enabled. Press "h" for help.');
	}

	private handleKeypress(key: readline.Key): void {
		if (key.ctrl && key.name === "c") {
			this.exit();
		} else {
			if (key.name === "x") {
				this.exit()
				return
			}
			switch (key.name) {
				case "h":
					this.showHelp();
					break;
				case "g":
					this.greetUser();
					break;
				case "s":
					this.saveSessions();
					break;
				case "e":
					this.exit();
					break;
				default:
					this.log.verbose(`Unknown key: ${key.name}`);
					break;
			}
		}
	}

	private showHelp(): void {
		this.log.info("Available hotkeys:");
		this.log.info("  h - Show this help message");
		this.log.info("  s - Save all active sessions");
		this.log.info("  g - Greet the user");
		this.log.info("  e - Exit the program");
	}

	private greetUser(): void {
		this.log.info("Hello, user!");
	}

	private saveSessions(): void {
		const recorder = getSessionRecorder();
		if (!recorder?.isRecordingEnabled()) {
			this.log.info("Session recording is not enabled. Set RECORD_SESSIONS=true to enable.");
			return;
		}
		const saved = saveAllSessions("Manual save via hotkey");
		if (saved.length === 0) {
			this.log.info("No active sessions to save.");
		} else {
			this.log.info(`Saved ${saved.length} session(s): ${saved.join(", ")}`);
		}
	}

	private async exit(): Promise<void> {
		this.log.info("Exiting...");
		
		// Save all sessions before exiting
		const recorder = getSessionRecorder();
		if (recorder?.isRecordingEnabled()) {
			const saved = saveAllSessions("Auto-saved on server exit");
			if (saved.length > 0) {
				this.log.info(`Saved ${saved.length} session(s) before exit.`);
			}
		}
		
		this.rl.close();
        if (this.GatewayServer) {
            await this.GatewayServer.exit();
        }
	}
}
