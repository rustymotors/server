import { _resetChannelMembership } from 'rusty-motors-shared/test';
import { TestClient } from './TestClient.js';

/**
 * Coordinator for N virtual clients that share the same ChannelMembership
 * store. Create one per test; call close() in afterEach.
 *
 * Usage:
 *   const session = new MultiClientSession();
 *   const alice = session.client('alice');
 *   const bob   = session.client('bob');
 *   // ... run scenario ...
 *   await session.close();
 */
export class MultiClientSession {
    private readonly _clients = new Map<string, TestClient>();

    /**
     * Get (or lazily create) a named TestClient.
     * The connectionId will be `test-<name>:<port>`.
     */
    client(name: string, port: number = 7003): TestClient {
        if (!this._clients.has(name)) {
            this._clients.set(name, new TestClient(name, port));
        }
        return this._clients.get(name)!;
    }

    /** Reset all channel membership state and close every client. */
    async close(): Promise<void> {
        _resetChannelMembership();
        for (const c of this._clients.values()) {
            c.close();
        }
        this._clients.clear();
    }
}
