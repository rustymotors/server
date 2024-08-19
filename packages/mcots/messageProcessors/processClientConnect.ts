import { createDataEncryptionPair } from 'rusty-motors-connection';
import type { ServerSocketCallback } from 'rusty-motors-mcots';
import {
    ClientConnectionManager,
    ClientConnectionMessage,
    ErrorNoKey,
} from 'rusty-motors-mcots';
import { UserStatusManager } from 'rusty-motors-nps';
import { getServerLogger } from 'rusty-motors-shared';
import { ServerMessage } from 'rusty-motors-shared-packets';
import { sendSuccess } from './sendSuccess.js';

const log = getServerLogger();

export async function processClientConnect(
    connectionId: string,
    message: ServerMessage,
    socketCallback: ServerSocketCallback
): Promise<void> {
    log.setName('processClientConnect');
    try {
        log.debug(`Processing client connect request: ${message.toString()}`);

        const request = new ClientConnectionMessage(
            message.getDataBuffer().length
        ).deserialize(message.getDataBuffer());

        log.debug(`Received client connect request: ${request.toString()}`);

        const userStatus = UserStatusManager.getUserStatus(
            request.getCustomerId()
        );

        if (!userStatus) {
            log.error(
                `User status not found for customer ID: ${request.getCustomerId()}`
            );
            return;
        }

        log.debug(`User status found: ${userStatus.toString()}`);

        // Get the connection record
        const connection = ClientConnectionManager.getConnection(connectionId);

        if (!connection) {
            log.error(
                `Connection not found for connection ID: ${connectionId}`
            );
            return;
        }

        log.debug(`Connection found: ${connection.toString()}`);

        const sessionKey = userStatus.getSessionKey();

        if (!sessionKey) {
            log.error(
                `Session key not found for customer ID: ${request.getCustomerId()}`
            );
            return;
        }

        const cipherPair = createDataEncryptionPair(sessionKey.getKey());

        connection.setCipherPair(cipherPair);

        sendSuccess(message, socketCallback);

        log.resetName();
        return Promise.resolve();
    } catch (error) {
        if (error instanceof ErrorNoKey) {
            log.error(
                `Error processing client connect request: ${error.message}`
            );
        } else {
            log.error(
                `Error processing client connect request: ${error as string}`
            );
            throw error;
        }
    }
}

// Path: packages/mcots/messageProcessors/processClientConnect.ts
