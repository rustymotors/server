import { getServerLogger, type ServerLogger } from "rusty-motors-shared";

/**
 * Handles socket errors by logging them.
 * Never throws - all errors are logged to prevent uncaught exceptions from crashing the server.
 *
 * @param {Object} params - The parameters for the socket error handler.
 * @param {string} params.connectionId - The ID of the connection where the error occurred.
 * @param {NodeJS.ErrnoException} params.error - The error object containing details of the socket error.
 * @param {ServerLogger} [params.log] - Optional logger instance for logging error details. Defaults to a server logger named "socketErrorHandler".
 */
export function socketErrorHandler({
	connectionId,
	error,
	log = getServerLogger("socketErrorHandler"),
}: {
	connectionId: string;
	error: NodeJS.ErrnoException;
	log?: ServerLogger;
}) {
	// Handle socket errors - all errors are logged, never thrown
	if (error.code === "ECONNRESET") {
		log.debug("Connection reset by peer", { connectionId });
		return;
	}
	// Log other socket errors without throwing - throwing from event handlers crashes the process
	log.error("Socket error", { connectionId, err: error });
}
