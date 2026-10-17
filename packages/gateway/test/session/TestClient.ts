import { MessageQueue, addSocketPair, type messageQueueItem } from 'rusty-motors-shared';
import type { TaggedSocket } from 'rusty-motors-shared';

/**
 * A virtual NPS client connection backed by real MessageQueue instances.
 *
 * Unlike unit tests that mock getSocketQueue, TestClient registers real queues
 * under a connectionId so that relay/broadcast handlers deliver packets
 * through the actual queue infrastructure.
 *
 * Usage:
 *   const client = new TestClient('alice');
 *   // ... set up ChannelMembership state ...
 *   await handleSomething({ connectionId: client.connectionId, ... });
 *   const packets = await client.drain();
 *   expect(packets).toHaveLength(1);
 */
export class TestClient {
    readonly connectionId: string;
    readonly port: number;

    private readonly _captured: Buffer[] = [];
    private readonly _sendQueue: MessageQueue;
    private readonly _receiveQueue: MessageQueue;

    constructor(name: string, port: number = 7003) {
        this.port = port;
        this.connectionId = `test-${name}:${port}`;

        this._sendQueue = new MessageQueue(
            `${name}-send`,
            10,
            async (item: messageQueueItem) => {
                this._captured.push(Buffer.from(item.data));
            },
        );

        this._receiveQueue = new MessageQueue(
            `${name}-receive`,
            10,
            async () => {},
        );

        const mockSocket: TaggedSocket = {
            connectionId: this.connectionId,
            localPort: port,
            connectedAt: Date.now(),
            socket: {
                write: () => true,
                end: () => {},
                destroyed: false,
            } as unknown as TaggedSocket['socket'],
        };

        addSocketPair(this.connectionId, {
            send: this._sendQueue,
            receive: this._receiveQueue,
        });

        // Suppress unused variable warning
        void mockSocket;
    }

    /**
     * Wait for the send queue to flush and return all packets captured since
     * the last drain (or since construction). Clears the captured list.
     */
    async drain(waitMs: number = 100): Promise<Buffer[]> {
        await new Promise<void>((r) => setTimeout(r, waitMs));
        const packets = this._captured.splice(0);
        return packets;
    }

    /** Tear down the queues. Call in afterEach. */
    close(): void {
        this._sendQueue.exit();
        this._receiveQueue.exit();
    }
}
