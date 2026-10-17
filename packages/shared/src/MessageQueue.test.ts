import { describe, it, expect, vi, afterEach } from 'vitest';
import { MessageQueue } from './MessageQueue.js';

describe('MessageQueue', () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('assigns sequenceNo and processes a single item', async () => {
        vi.useFakeTimers();
        const cb = vi.fn(async (_item: unknown) => Promise.resolve());
        const q = new MessageQueue('test', 50, cb);

        const item = { payload: 'one' } as any;
        q.put(item);

        // advance past one tick so the run loop wakes and processes the queue
        await vi.advanceTimersByTimeAsync(60);
        // allow any pending microtasks to settle
        await Promise.resolve();

        expect(cb).toHaveBeenCalledTimes(1);
        const calledArg = cb.mock.calls[0]![0]! as any;
        expect(calledArg.sequenceNo).toBe(1);
        expect(calledArg.payload).toBe('one');

        q.exit();
    });

    it('processes multiple items in order and increments sequenceNo', async () => {
        vi.useFakeTimers();
        const cb = vi.fn(async (_item: unknown) => Promise.resolve());
        const q = new MessageQueue('test', 50, cb);

        const a = { payload: 'a' } as any;
        const b = { payload: 'b' } as any;
        q.put(a);
        q.put(b);

        await vi.advanceTimersByTimeAsync(60);
        await Promise.resolve();

        expect(cb).toHaveBeenCalledTimes(2);
        const first = cb.mock.calls[0]![0]! as any;
        const second = cb.mock.calls[1]![0]! as any;
        expect(first.sequenceNo).toBe(1);
        expect(second.sequenceNo).toBe(2);
        expect(first.payload).toBe('a');
        expect(second.payload).toBe('b');

        q.exit();
    });

    it('does not process items after exit is called', async () => {
        vi.useFakeTimers();
        const cb = vi.fn(async (_item: unknown) => Promise.resolve());
        const q = new MessageQueue('test', 50, cb);

        q.exit();
        const item = { payload: 'should-not-run' } as any;
        q.put(item);

        await vi.advanceTimersByTimeAsync(200);
        await Promise.resolve();

        expect(cb).not.toHaveBeenCalled();
    });
});