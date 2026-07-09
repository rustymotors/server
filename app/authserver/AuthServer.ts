import { IncomingMessage, ServerResponse, createServer } from "http";
import { getServerLogger } from "rusty-motors-shared";
import { AuthServerConfig } from "./config.ts";
import { handleAuthLogin } from "./handleAuthLogin.ts";
import { handleShardList } from "./handleShardList.ts";

export class AuthServer {

	constructor(private config: AuthServerConfig, private log: ReturnType<typeof getServerLogger>) {
		this.log = log.child({ name: "auth-server" });
		this.config = config;
	}

	handleRequest(req: IncomingMessage, res: ServerResponse) {
		if (!req.url || !req.method) {
			res.writeHead(400, { 'Content-Type': 'text/plain' });
			res.end('Bad Request\n');
			return;
		}

		// Handle incoming requests here
		this.log.info(`Received request: ${req.method} ${new URL(req.url, `http://${req.headers.host}`).pathname}`);

		if (req.url.startsWith("/AuthLogin")) {
			// Handle AuthLogin request
			handleAuthLogin.call(this, req, res);
		} else if (req.url === "/ShardList/") {
			// Handle ShardList request
			// Implement shard list retrieval logic here
			handleShardList.call(this, req, res);
		}
		else {
			res.writeHead(404, { 'Content-Type': 'text/plain' });
			res.end('Not Found\n');
			return;
		}
	}

	public start() {
		this.log.info("AuthServer started successfully.");
		// Initialize server components here (e.g., HTTP server, routes, etc.)
		const server = createServer((this.handleRequest).bind(this));

		const port = parseInt("3000", 10);
		server.listen(port, '0.0.0.0', () => {
			this.log.info(`AuthServer listening on port ${port}`);
		});

		process.on('SIGINT', () => {
			this.log.info('Received SIGINT. Shutting down gracefully...');
			server.close(() => {
				this.stop();
				process.exit(0);
			});
		});

		process.on('SIGTERM', () => {
			this.log.info('Received SIGTERM. Shutting down gracefully...');
			server.close(() => {
				this.stop();
				process.exit(0);
			});
		});
	}
	public stop() {
		this.log.info("AuthServer stopped successfully.");
		// Clean up resources here
	}
}
