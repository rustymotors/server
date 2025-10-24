import { getServerLogger, ServerLogger } from "rusty-motors-shared";
import { getMCOProtocolInstance } from "./MCOProtocol.js";

export function writePacket({
	connectionId, data, log = getServerLogger("MCOProtocol/writePacket"),
}: {
	connectionId: string;
	data: Buffer;
	log?: ServerLogger;
}) {
	log.debug(
        `Writing packet: ${data.toString("hex")}`,
        { connectionId }, 
    );
	try {
		const connection = getMCOProtocolInstance().getConnection(connectionId);
		if (connection) {
			connection.socket.write(data);
			connection.socket.write(data);
		} else {
			log.error(
                "Connection not found",
                { connectionId }, 
            );
		}
	} catch (error) {
		log.error(
            `Error writing packet: ${error}`,
            { connectionId }, 
        );
	}
}